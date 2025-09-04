from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import asyncio
import uuid
from typing import Dict, List, Optional
import logging
from contextlib import asynccontextmanager
from posture_checker import PhysiotherapyPostureChecker
from report_reader.report_parser import MedicalExerciseRecommendationSystem
from pypdf import PdfReader
import io

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global storage for active connections and checkers
active_connections: Dict[str, WebSocket] = {}
posture_checkers: Dict[str, PhysiotherapyPostureChecker] = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up Physiotherapy Posture Analysis Server...")
    yield
    # Shutdown
    logger.info("Shutting down...")
    # Clean up all posture checkers
    for checker in posture_checkers.values():
        checker.close()

app = FastAPI(
    title="Physiotherapy Posture Analysis API",
    description="Real-time posture analysis for physiotherapy exercises",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],  # Add your Next.js URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ExerciseChangeRequest(BaseModel):
    exercise_name: str

class SessionInfo(BaseModel):
    session_id: str
    exercises: List[str]
    current_exercise: str

class AnalysisResult(BaseModel):
    success: bool
    score: float
    is_correct: bool
    exercise_name: str
    feedback_messages: List[str]
    audio_feedback: Optional[str]
    individual_scores: Dict[str, float]
    error: Optional[str] = None

# REST endpoints
@app.get("/")
async def root():
    return {"message": "Physiotherapy Posture Analysis Server", "status": "running"}

@app.get("/exercises")
async def get_exercises():
    """Get list of available exercises."""
    try:
        # Create a temporary checker to get exercises
        temp_checker = PhysiotherapyPostureChecker()
        exercises = temp_checker.get_available_exercises()
        temp_checker.close()
        return {"exercises": exercises}
    except Exception as e:
        #logger.error(f"Error getting exercises: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/session")
async def create_session():
    """Create a new analysis session."""
    session_id = str(uuid.uuid4())
    return {"session_id": session_id}

@app.post("/session/{session_id}/exercise")
async def change_exercise(session_id: str, request: ExerciseChangeRequest):
    """Change exercise for a specific session."""
    if session_id not in posture_checkers:
        raise HTTPException(status_code=404, detail="Session not found")
    
    checker = posture_checkers[session_id]
    success = checker.change_exercise(request.exercise_name)
    
    if success:
        return {"success": True, "current_exercise": request.exercise_name}
    else:
        raise HTTPException(status_code=400, detail="Invalid exercise name")

@app.delete("/session/{session_id}")
async def end_session(session_id: str):
    """End an analysis session."""
    if session_id in posture_checkers:
        posture_checkers[session_id].close()
        del posture_checkers[session_id]
    
    if session_id in active_connections:
        del active_connections[session_id]
    
    return {"success": True, "message": "Session ended"}

# WebSocket endpoint
@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    logger.info(f"WebSocket connection accepted for session: {session_id}")
    
    # Store connection and create posture checker
    active_connections[session_id] = websocket
    posture_checkers[session_id] = PhysiotherapyPostureChecker()
    
    try:
        # Send initial session info
        checker = posture_checkers[session_id]
        session_info = {
            "type": "session_info",
            "data": {
                "session_id": session_id,
                "exercises": checker.get_available_exercises(),
                "current_exercise": checker.current_exercise.replace('_', ' ').title()
            }
        }
        await websocket.send_text(json.dumps(session_info))
        
        while True:
            # Receive message from client
            #logger.info(f"Waiting for message from session: {session_id}")
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                await handle_websocket_message(websocket, session_id, message)
                
            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected for session: {session_id}")
                break
            except json.JSONDecodeError:
                error_msg = {"type": "error", "data": {"error": "Invalid JSON format"}}
                await websocket.send_text(json.dumps(error_msg))
            except Exception as e:
                logger.error(f"Error handling message: {e}")
                error_msg = {"type": "error", "data": {"error": str(e)}}
                await websocket.send_text(json.dumps(error_msg))
    
    except Exception as e:
        logger.error(f"WebSocket error for session {session_id}: {e}")
    
    finally:
        # Clean up
        if session_id in active_connections:
            del active_connections[session_id]
        if session_id in posture_checkers:
            posture_checkers[session_id].close()
            del posture_checkers[session_id]
        logger.info(f"Cleaned up session: {session_id}")

async def handle_websocket_message(websocket: WebSocket, session_id: str, message: Dict):
    """Handle different types of WebSocket messages."""
    #logger.info(f"Received message for session {session_id}: {message}")
    message_type = message.get("type")
    data = message.get("data", {})
    
    if session_id not in posture_checkers:
        error_msg = {"type": "error", "data": {"error": "Session not found"}}
        await websocket.send_text(json.dumps(error_msg))
        return
    
    checker = posture_checkers[session_id]
    
    try:
        if message_type == "frame":
            # Process video frame
            frame_data = data.get("frame")
            if not frame_data:
                error_msg = {"type": "error", "data": {"error": "No frame data provided"}}
                #logger.warning(f"Frame data missing in session {session_id}")
                await websocket.send_text(json.dumps(error_msg))
                return
            
            # Analyze posture
            #logger.info(f"Processing frame for session {session_id}")
            result = checker.process_frame_base64(frame_data)
            # Send result back to client
            response = {
                "type": "analysis_result",
                "data": result
            }
            await websocket.send_text(json.dumps(response))
        
        elif message_type == "change_exercise":
            # Change current exercise
            exercise_name = data.get("exercise_name")
            if not exercise_name:
                error_msg = {"type": "error", "data": {"error": "Exercise name required"}}
                await websocket.send_text(json.dumps(error_msg))
                return
            
            success = checker.change_exercise(exercise_name)
            
            response = {
                "type": "exercise_changed",
                "data": {
                    "success": success,
                    "current_exercise": exercise_name if success else checker.current_exercise.replace('_', ' ').title(),
                    "message": "Exercise changed successfully" if success else "Invalid exercise name"
                }
            }
            await websocket.send_text(json.dumps(response))
        
        elif message_type == "get_exercises":
            # Get available exercises
            exercises = checker.get_available_exercises()
            response = {
                "type": "exercises_list",
                "data": {
                    "exercises": exercises,
                    "current_exercise": checker.current_exercise.replace('_', ' ').title()
                }
            }
            await websocket.send_text(json.dumps(response))
        
        elif message_type == "reload_exercises":
            # Reload exercises from config file
            checker.reload_exercises()
            exercises = checker.get_available_exercises()
            response = {
                "type": "exercises_reloaded",
                "data": {
                    "exercises": exercises,
                    "message": "Exercises reloaded from configuration file"
                }
            }
            await websocket.send_text(json.dumps(response))
        
        elif message_type == "get_session_stats":
            # Get session statistics
            stats = {
                "pose_history": checker.pose_history[-10:] if len(checker.pose_history) > 0 else [],
                "current_exercise": checker.current_exercise.replace('_', ' ').title(),
                "feedback_cooldown": checker.feedback_cooldown,
                "correct_pose_threshold": checker.correct_pose_threshold
            }
            response = {
                "type": "session_stats",
                "data": stats
            }
            await websocket.send_text(json.dumps(response))
        
        elif message_type == "update_settings":
            # Update analysis settings
            threshold = data.get("correct_pose_threshold")
            cooldown = data.get("feedback_cooldown")
            
            if threshold is not None and 0 <= threshold <= 1:
                checker.correct_pose_threshold = threshold
            
            if cooldown is not None and cooldown >= 0:
                checker.max_feedback_cooldown = int(cooldown)
            
            response = {
                "type": "settings_updated",
                "data": {
                    "correct_pose_threshold": checker.correct_pose_threshold,
                    "max_feedback_cooldown": checker.max_feedback_cooldown,
                    "message": "Settings updated successfully"
                }
            }
            await websocket.send_text(json.dumps(response))
        
        elif message_type == "ping":
            # Health check / keepalive
            response = {
                "type": "pong",
                "data": {
                    "timestamp": data.get("timestamp"),
                    "session_id": session_id,
                    "status": "active",
                    "current_exercise": checker.current_exercise.replace('_', ' ').title()
                }
            }
            await websocket.send_text(json.dumps(response))
        
        elif message_type == "start_recording":
            # Start recording session data (could be extended for data persistence)
            response = {
                "type": "recording_started",
                "data": {
                    "session_id": session_id,
                    "timestamp": data.get("timestamp"),
                    "message": "Session recording started"
                }
            }
            await websocket.send_text(json.dumps(response))
        
        elif message_type == "stop_recording":
            # Stop recording session data
            response = {
                "type": "recording_stopped",
                "data": {
                    "session_id": session_id,
                    "timestamp": data.get("timestamp"),
                    "message": "Session recording stopped"
                }
            }
            await websocket.send_text(json.dumps(response))
        
        else:
            error_msg = {
                "type": "error", 
                "data": {"error": f"Unknown message type: {message_type}"}
            }
            await websocket.send_text(json.dumps(error_msg))
    
    except Exception as e:
        logger.error(f"Error processing message type '{message_type}': {e}")
        error_msg = {
            "type": "error",
            "data": {"error": f"Processing error: {str(e)}"}
        }
        await websocket.send_text(json.dumps(error_msg))

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "active_sessions": len(active_connections),
        "active_checkers": len(posture_checkers),
        "server": "Physiotherapy Posture Analysis API",
        "version": "1.0.0"
    }

# Stats endpoint
@app.get("/stats")
async def get_stats():
    """Get server statistics."""
    session_stats = {}
    for session_id, checker in posture_checkers.items():
        session_stats[session_id] = {
            "current_exercise": checker.current_exercise,
            "pose_history_length": len(checker.pose_history),
            "recent_scores": checker.pose_history[-5:] if checker.pose_history else []
        }
    
    return {
        "active_connections": len(active_connections),
        "active_sessions": len(posture_checkers),
        "sessions": list(posture_checkers.keys()),
        "session_details": session_stats
    }

# Reload exercises endpoint
@app.post("/reload-exercises")
async def reload_all_exercises():
    """Reload exercises for all active sessions."""
    try:
        reloaded_sessions = []
        for session_id, checker in posture_checkers.items():
            checker.reload_exercises()
            reloaded_sessions.append(session_id)
        
        return {
            "success": True,
            "message": "Exercises reloaded for all sessions",
            "affected_sessions": reloaded_sessions
        }
    except Exception as e:
        logger.error(f"Error reloading exercises: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Broadcast message to all sessions
@app.post("/broadcast")
async def broadcast_message(message: str):
    """Broadcast a message to all active WebSocket connections."""
    broadcast_data = {
        "type": "broadcast",
        "data": {
            "message": message,
            "timestamp": asyncio.get_event_loop().time()
        }
    }
    
    disconnected_sessions = []
    for session_id, websocket in active_connections.items():
        try:
            await websocket.send_text(json.dumps(broadcast_data))
        except Exception as e:
            logger.warning(f"Failed to send broadcast to session {session_id}: {e}")
            disconnected_sessions.append(session_id)
    
    # Clean up disconnected sessions
    for session_id in disconnected_sessions:
        if session_id in active_connections:
            del active_connections[session_id]
        if session_id in posture_checkers:
            posture_checkers[session_id].close()
            del posture_checkers[session_id]
    
    return {
        "success": True,
        "message": f"Broadcast sent to {len(active_connections)} sessions",
        "disconnected_sessions": disconnected_sessions
    }

@app.post("/process_report")
async def process_report(file: UploadFile = File(...)):
    # Read PDF into memory
    pdf_bytes = await file.read()
    reader = PdfReader(io.BytesIO(pdf_bytes))
    report_text = " ".join([page.extract_text() for page in reader.pages if page.extract_text()])

    recommender = MedicalExerciseRecommendationSystem()
    recommender.load_available_exercises("exercises.txt")
        
    # Train models
    recommender.train_models()
    
    # Extract medical features
    medical_features = recommender.extract_medical_features(report_text)
    
    # Get recommendations
    recommendations = recommender.predict_exercise_recommendations(medical_features)
    revised_recommendations = []
    for name, details in recommendations.items():
        revised_recommendations.append({
            "name": name,
            "sets": details["parameters"]["sets"], 
            "reps": details["parameters"]["reps_per_set"],
            "duration": details["parameters"]["duration_seconds"],
            "confidence": details["recommendation_confidence"]
        })

    # Sort by confidence (descending)
    revised_recommendations.sort(key=lambda x: x["confidence"], reverse=True)

    # Pick top 3
    top3_recommendations = revised_recommendations[:3]

    
    # Create final result
    result = {
        # 'patient_summary': {
        #     'age': medical_features.get('age', 'Unknown'),
        #     'severity_level': medical_features.get('severity', 'Unknown'),
        #     'functional_level': medical_features.get('functional_level', 'Unknown'),
        #     'identified_conditions': list(medical_features.get('condition_scores', {}).keys()),
        #     'limitations': medical_features.get('limitations', [])
        # },
        # 'medical_analysis': {
        #     'text_length': medical_features.get('medical_text_length', 0),
        #     'keywords_found': medical_features.get('medical_keywords_count', 0),
        #     'primary_conditions': medical_features.get('condition_scores', {})
        # },
        'available_exercises_count': len(recommender.available_exercises),
        'recommended_exercises': top3_recommendations,
        'total_recommendations': len(recommendations)
    }
    return {"success": True, "result": result}

if __name__ == "__main__":
    import uvicorn
    
    # Run the server
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info",
        access_log=True
    )