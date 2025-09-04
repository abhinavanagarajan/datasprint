import cv2
import numpy as np
import mediapipe as mp
import math
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import base64
import json
from exercise_parser import ExerciseParser, PostureRule

@dataclass
class PostureScore:
    """Store posture evaluation results."""
    overall_score: float
    individual_scores: Dict[str, float]
    feedback_messages: List[str]
    is_correct: bool
    exercise_name: str
    audio_feedback: str  # Simplified feedback for text-to-speech

class PhysiotherapyPostureChecker:
    def __init__(self, config_file: str = "exercises.txt"):
        """Initialize the posture checker system."""
        # Initialize MediaPipe
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            enable_segmentation=False,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7
        )
        
        # Define landmark indices for easier access
        self.landmark_names = {
            'nose': 0, 'left_eye_inner': 1, 'left_eye': 2, 'left_eye_outer': 3,
            'right_eye_inner': 4, 'right_eye': 5, 'right_eye_outer': 6,
            'left_ear': 7, 'right_ear': 8, 'mouth_left': 9, 'mouth_right': 10,
            'left_shoulder': 11, 'right_shoulder': 12, 'left_elbow': 13,
            'right_elbow': 14, 'left_wrist': 15, 'right_wrist': 16,
            'left_pinky': 17, 'right_pinky': 18, 'left_index': 19,
            'right_index': 20, 'left_thumb': 21, 'right_thumb': 22,
            'left_hip': 23, 'right_hip': 24, 'left_knee': 25, 'right_knee': 26,
            'left_ankle': 27, 'right_ankle': 28, 'left_heel': 29,
            'right_heel': 30, 'left_foot_index': 31, 'right_foot_index': 32
        }
        
        # Initialize exercise parser
        self.exercise_parser = ExerciseParser(config_file)
        self.current_exercise = "LEFT_ARM_RAISE"  # Default exercise
        
        # Tracking variables
        self.pose_history = []
        self.max_history = 30  # frames
        self.correct_pose_threshold = 0.8
        self.feedback_cooldown = 0
        self.max_feedback_cooldown = 300  # frames between audio feedback
        
    def calculate_angle(self, p1: Tuple[float, float], p2: Tuple[float, float], 
                       p3: Tuple[float, float]) -> float:
        """Calculate angle between three points."""
        # Convert to numpy arrays
        p1, p2, p3 = np.array(p1), np.array(p2), np.array(p3)
        
        # Calculate vectors
        v1 = p1 - p2
        v2 = p3 - p2
        
        # Calculate angle
        cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
        cos_angle = np.clip(cos_angle, -1.0, 1.0)  # Handle numerical errors
        angle = np.arccos(cos_angle)
        
        return math.degrees(angle)
    
    def extract_landmarks(self, pose_results) -> Optional[Dict[str, Tuple[float, float]]]:
        """Extract landmark coordinates from pose results."""
        if not pose_results.pose_landmarks:
            return None
        
        landmarks = {}
        for name, idx in self.landmark_names.items():
            landmark = pose_results.pose_landmarks.landmark[idx]
            if landmark.visibility > 0.5:  # Only use visible landmarks
                landmarks[name] = (landmark.x, landmark.y)
        
        return landmarks
    
    def evaluate_posture_rule(self, landmarks: Dict[str, Tuple[float, float]], 
                             rule: PostureRule) -> Tuple[float, str, str]:
        """Evaluate a single posture rule."""
        # Check if all required landmarks are available
        if not all(joint in landmarks for joint in [rule.joint1, rule.joint2, rule.joint3]):
            return 0.0, f"Cannot evaluate: {rule.description} (landmarks not visible)", "Position yourself so I can see you better"
        
        # Calculate angle
        p1 = landmarks[rule.joint1]
        p2 = landmarks[rule.joint2]
        p3 = landmarks[rule.joint3]
        
        current_angle = self.calculate_angle(p1, p2, p3)
        
        # Check if angle is within acceptable range
        min_angle, max_angle = rule.angle_range
        
        if min_angle <= current_angle <= max_angle:
            score = 1.0
            visual_feedback = f"✓ {rule.description} (angle: {current_angle:.1f}°)"
            audio_feedback = f"Good! {rule.description}"
        else:
            # Calculate how far off the angle is
            if current_angle < min_angle:
                distance = min_angle - current_angle
                visual_feedback = f"✗ {rule.description} - increase angle by {distance:.1f}° (current: {current_angle:.1f}°)"
                audio_feedback = f"Increase the angle. {rule.description}"
            else:
                distance = current_angle - max_angle
                visual_feedback = f"✗ {rule.description} - decrease angle by {distance:.1f}° (current: {current_angle:.1f}°)"
                audio_feedback = f"Decrease the angle. {rule.description}"
            
            # Score based on how close to acceptable range
            max_distance = max(abs(current_angle - min_angle), abs(current_angle - max_angle))
            score = max(0.0, 1.0 - (max_distance / 90.0))  # Normalize by 90 degrees
        
        return score, visual_feedback, audio_feedback
    
    def evaluate_posture(self, pose_results) -> PostureScore:
        """Evaluate current posture against exercise rules."""
        landmarks = self.extract_landmarks(pose_results)
        
        if not landmarks:
            return PostureScore(
                overall_score=0.0,
                individual_scores={},
                feedback_messages=["No pose detected"],
                is_correct=False,
                exercise_name=self.current_exercise,
                audio_feedback="Please position yourself in front of the camera"
            )
        
        # Get rules for current exercise
        rules = self.exercise_parser.get_exercise_rules(self.current_exercise)
        
        if not rules:
            return PostureScore(
                overall_score=0.0,
                individual_scores={},
                feedback_messages=["No rules defined for this exercise"],
                is_correct=False,
                exercise_name=self.current_exercise,
                audio_feedback="Exercise configuration not found"
            )
        
        # Evaluate each rule
        individual_scores = {}
        feedback_messages = []
        audio_feedbacks = []
        total_weighted_score = 0.0
        total_weight = 0.0
        
        for i, rule in enumerate(rules):
            score, visual_feedback, audio_feedback = self.evaluate_posture_rule(landmarks, rule)
            individual_scores[f"rule_{i}"] = score
            feedback_messages.append(visual_feedback)
            
            # Only include audio feedback for failed rules with high weight
            if score < 0.8 and rule.weight >= 1.5:
                audio_feedbacks.append(audio_feedback)
            
            total_weighted_score += score * rule.weight
            total_weight += rule.weight
        
        # Calculate overall score
        overall_score = total_weighted_score / total_weight if total_weight > 0 else 0.0
        is_correct = overall_score >= self.correct_pose_threshold
        
        # Generate audio feedback
        if is_correct:
            audio_feedback = f"Excellent! You're performing the {self.current_exercise.replace('_', ' ').lower()} correctly."
        elif audio_feedbacks:
            audio_feedback = " ".join(audio_feedbacks[:2])  # Limit to 2 most important feedbacks
        else:
            audio_feedback = f"Keep adjusting your posture for the {self.current_exercise.replace('_', ' ').lower()}"
        
        return PostureScore(
            overall_score=overall_score,
            individual_scores=individual_scores,
            feedback_messages=feedback_messages,
            is_correct=is_correct,
            exercise_name=self.current_exercise,
            audio_feedback=audio_feedback
        )
    
    def process_frame_base64(self, frame_base64: str) -> Dict:
        """Process a base64 encoded frame and return analysis results."""
        try:
            # Decode base64 frame
            frame_data = base64.b64decode(frame_base64.split(',')[1] if ',' in frame_base64 else frame_base64)
            nparr = np.frombuffer(frame_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                return {
                    "error": "Invalid frame data",
                    "score": 0.0,
                    "feedback": "Could not process frame"
                }
            
            # Convert to RGB for MediaPipe
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process pose
            results = self.pose.process(rgb_frame)

            landmarks_data = []
            if results.pose_landmarks:
                for lm in results.pose_landmarks.landmark:
                    landmarks_data.append({
                        "x": lm.x,
                        "y": lm.y,
                        "z": lm.z,
                        "visibility": lm.visibility
                    })

            
            # Evaluate posture
            score = self.evaluate_posture(results)
            
            # Update pose history
            self.pose_history.append(score.overall_score)
            if len(self.pose_history) > self.max_history:
                self.pose_history.pop(0)
            
            # Update feedback cooldown
            if self.feedback_cooldown > 0:
                self.feedback_cooldown -= 1
            
            # Determine if we should provide audio feedback
            should_provide_audio = (
                self.feedback_cooldown == 0 and 
                (not score.is_correct or score.overall_score == 1.0)
            )
            
            if should_provide_audio:
                self.feedback_cooldown = self.max_feedback_cooldown
                audio_feedback = score.audio_feedback
            else:
                audio_feedback = None
            
            # Create annotated frame
            annotated_frame = self.draw_pose_landmarks(frame, results)
            
            # Encode annotated frame back to base64
            _, buffer = cv2.imencode('.jpg', annotated_frame)
            annotated_base64 = base64.b64encode(buffer).decode('utf-8')
            
            return {
                "success": True,
                "score": score.overall_score,
                "is_correct": score.is_correct,
                "exercise_name": score.exercise_name,
                "feedback_messages": score.feedback_messages,
                "audio_feedback": audio_feedback,
                "annotated_frame": f"data:image/jpeg;base64,{annotated_base64}",
                "individual_scores": score.individual_scores,
                "landmarks": landmarks_data
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "success": False,
                "score": 0.0,
                "feedback": "Error processing frame"
            }
    
    def draw_pose_landmarks(self, frame: np.ndarray, results) -> np.ndarray:
        """Draw pose landmarks on the frame."""
        if results.pose_landmarks:
            self.mp_drawing.draw_landmarks(
                frame, results.pose_landmarks, self.mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=self.mp_drawing_styles.get_default_pose_landmarks_style()
            )
        return frame
    
    def change_exercise(self, exercise_name: str) -> bool:
        """Change the current exercise being evaluated."""
        available_exercises = self.exercise_parser.get_exercise_names()
        exercise_key = exercise_name.upper().replace(' ', '_')
        
        if exercise_key in available_exercises:
            self.current_exercise = exercise_key
            self.pose_history.clear()
            self.feedback_cooldown = 0
            return True
        return False
    
    def get_available_exercises(self) -> List[str]:
        """Get list of available exercises."""
        return [name.replace('_', ' ').title() for name in self.exercise_parser.get_exercise_names()]
    
    def reload_exercises(self):
        """Reload exercises from configuration file."""
        self.exercise_parser.reload_exercises()
    
    def close(self):
        """Clean up resources."""
        if hasattr(self, 'pose') and self.pose:
            self.pose.close()

# Example usage for testing
if __name__ == "__main__":
    checker = PhysiotherapyPostureChecker()
    print("Available exercises:", checker.get_available_exercises())
    
    # Test with webcam
    cap = cv2.VideoCapture(0)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Flip frame for mirror effect
        frame = cv2.flip(frame, 1)
        
        # Convert frame to base64 (simulate WebSocket data)
        _, buffer = cv2.imencode('.jpg', frame)
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        
        # Process frame
        result = checker.process_frame_base64(frame_base64)
        
        if result.get('success'):
            print(f"Score: {result['score']:.2f}, Audio: {result.get('audio_feedback', 'None')}")
        
        # Show frame (for testing)
        cv2.imshow('Test', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    checker.close()