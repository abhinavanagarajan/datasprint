import json
import re
import PyPDF2
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, accuracy_score
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
import pickle
import os
from typing import Dict, List, Tuple, Any
import logging
import nltk
from collections import Counter

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MedicalExerciseRecommendationSystem:
    def __init__(self):
        self.available_exercises = {}
        self.recommendation_model = None
        self.parameter_models = {}
        self.text_vectorizer = TfidfVectorizer(
            max_features=500,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=2
        )
        self.label_encoders = {}
        self.scaler = StandardScaler()
        
    def read_medical_pdf(self, pdf_path: str) -> str:
        """Extract text content from medical PDF report"""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            logger.error(f"Error reading medical PDF {pdf_path}: {e}")
            return ""
    
    def read_exercises_file(self, file_path: str = "exercises.txt") -> str:
        """Read available exercises from text file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            logger.error(f"Error reading exercises file {file_path}: {e}")
            return ""
    
    def parse_exercise_config(self, text: str) -> Dict:
        """Parse exercise configuration from text"""
        exercises = {}
        lines = text.strip().split('\n')
        current_exercise = None
        
        for line in lines:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
                
            if line and not line.startswith('RULE:'):
                # This is an exercise name
                current_exercise = line
                exercises[current_exercise] = {
                    'rules': [],
                    'name': current_exercise
                }
            elif line.startswith('RULE:') and current_exercise:
                # Parse rule
                rule_content = line[5:].strip()  # Remove 'RULE:'
                rule = self.parse_rule(rule_content)
                if rule:
                    exercises[current_exercise]['rules'].append(rule)
        
        return exercises
    
    def parse_rule(self, rule_content: str) -> Dict:
        """Parse individual rule from rule content"""
        try:
            parts = rule_content.split('|')
            if len(parts) != 4:
                return None
                
            joints = parts[0].split(',')
            angle_range = parts[1].split(',')
            description = parts[2]
            weight = float(parts[3])
            
            return {
                'joints': [j.strip() for j in joints],
                'min_angle': float(angle_range[0]),
                'max_angle': float(angle_range[1]),
                'description': description.strip(),
                'weight': weight
            }
        except Exception as e:
            logger.error(f"Error parsing rule: {rule_content}, Error: {e}")
            return None
    
    def load_available_exercises(self, exercises_file: str = "exercises.txt") -> None:
        """Load available exercises from file"""
        text = self.read_exercises_file(exercises_file)
        if text:
            self.available_exercises = self.parse_exercise_config(text)
            logger.info(f"Loaded {len(self.available_exercises)} available exercises")
        else:
            # Use default exercises if file not found
            self.available_exercises = self.get_default_exercises()
            logger.info("Using default exercise configuration")
    
    def get_default_exercises(self) -> Dict:
        """Default exercise configuration"""
        config_text = """
SHOULDER_RAISE
RULE: left_shoulder,left_elbow,left_wrist|160,180|Left arm should be straight up|1.5
RULE: right_shoulder,right_elbow,right_wrist|160,180|Right arm should be straight up|1.5
RULE: left_shoulder,nose,right_shoulder|170,190|Keep shoulders level|1.0

LEFT_ARM_RAISE
RULE: left_shoulder,left_elbow,left_wrist|160,180|Left arm should be fully extended|2.0
RULE: left_hip,left_shoulder,left_elbow|80,100|Left arm should be raised to shoulder height or above|2.5
RULE: left_shoulder,nose,right_shoulder|165,195|Keep shoulders level - don't lean|1.5
RULE: right_shoulder,right_elbow,right_wrist|160,200|Right arm should remain relaxed at side|1.0
RULE: right_hip,right_shoulder,right_elbow|160,200|Right arm should stay down|1.2

RIGHT_ARM_RAISE
RULE: right_shoulder,right_elbow,right_wrist|160,180|Right arm should be fully extended|2.0
RULE: right_hip,right_shoulder,right_elbow|80,100|Right arm should be raised to shoulder height or above|2.5
RULE: left_shoulder,nose,right_shoulder|165,195|Keep shoulders level - don't lean|1.5
RULE: left_shoulder,left_elbow,left_wrist|160,200|Left arm should remain relaxed at side|1.0
RULE: left_hip,left_shoulder,left_elbow|160,200|Left arm should stay down|1.2

SQUAT
RULE: left_hip,left_knee,left_ankle|80,110|Left knee bent at proper angle|2.0
RULE: right_hip,right_knee,right_ankle|80,110|Right knee bent at proper angle|2.0
RULE: left_shoulder,left_hip,left_knee|160,190|Keep back straight|1.5

ARM_STRETCH
RULE: left_shoulder,left_elbow,left_wrist|170,190|Left arm should be extended|1.0
RULE: right_shoulder,right_elbow,right_wrist|170,190|Right arm should be extended|1.0
RULE: left_wrist,left_shoulder,right_shoulder|85,95|Arms should be perpendicular to body|1.2

STANDING_BALANCE
RULE: left_shoulder,left_hip,left_knee|170,190|Maintain upright posture|1.5
RULE: right_shoulder,right_hip,right_knee|170,190|Maintain upright posture|1.5
RULE: left_shoulder,nose,right_shoulder|170,190|Keep shoulders level|1.0

NECK_ROTATION
RULE: left_ear,nose,right_ear|160,200|Keep head aligned|1.0
RULE: left_shoulder,nose,right_shoulder|170,190|Keep shoulders stable|1.2

LEG_RAISE
RULE: left_hip,left_knee,left_ankle|160,180|Left leg should be straight|1.8
RULE: right_hip,right_knee,right_ankle|160,200|Right leg should remain stable|1.0
RULE: left_shoulder,left_hip,left_knee|80,100|Raise leg to appropriate height|2.0

WALKING_PRACTICE
RULE: left_hip,left_knee,left_ankle|160,180|Left leg should be straight during stance|1.5
RULE: right_hip,right_knee,right_ankle|160,180|Right leg should be straight during stance|1.5
RULE: left_shoulder,left_hip,left_knee|170,190|Maintain upright posture|1.2

GRIP_STRENGTH
RULE: left_shoulder,left_elbow,left_wrist|170,190|Arm should be extended|1.0
RULE: right_shoulder,right_elbow,right_wrist|170,190|Arm should be extended|1.0
"""
        return self.parse_exercise_config(config_text)
    
    def extract_medical_features(self, medical_text: str) -> Dict:
        """Extract relevant medical information from PDF text"""
        medical_text = medical_text.lower()
        
        # Define medical condition keywords and their associated exercises
        condition_exercise_mapping = {
            'stroke': ['ARM_STRETCH', 'SHOULDER_RAISE', 'LEFT_ARM_RAISE', 'RIGHT_ARM_RAISE', 'LEG_RAISE', 'STANDING_BALANCE'],
            'shoulder': ['SHOULDER_RAISE', 'ARM_STRETCH', 'LEFT_ARM_RAISE', 'RIGHT_ARM_RAISE'],
            'arm weakness': ['LEFT_ARM_RAISE', 'RIGHT_ARM_RAISE', 'ARM_STRETCH', 'GRIP_STRENGTH'],
            'leg weakness': ['LEG_RAISE', 'SQUAT', 'STANDING_BALANCE', 'WALKING_PRACTICE'],
            'balance': ['STANDING_BALANCE', 'LEG_RAISE', 'WALKING_PRACTICE'],
            'mobility': ['WALKING_PRACTICE', 'LEG_RAISE', 'STANDING_BALANCE', 'SQUAT'],
            'neck': ['NECK_ROTATION'],
            'posture': ['STANDING_BALANCE', 'SHOULDER_RAISE', 'NECK_ROTATION'],
            'range of motion': ['ARM_STRETCH', 'SHOULDER_RAISE', 'NECK_ROTATION', 'LEG_RAISE'],
            'hemiplegia': ['LEFT_ARM_RAISE', 'RIGHT_ARM_RAISE', 'LEG_RAISE', 'STANDING_BALANCE'],
            'hemiparesis': ['ARM_STRETCH', 'SHOULDER_RAISE', 'LEG_RAISE', 'WALKING_PRACTICE'],
            'paraplegia': ['ARM_STRETCH', 'SHOULDER_RAISE', 'GRIP_STRENGTH'],
            'spinal cord': ['ARM_STRETCH', 'SHOULDER_RAISE', 'GRIP_STRENGTH', 'STANDING_BALANCE'],
            'knee': ['LEG_RAISE', 'SQUAT', 'STANDING_BALANCE'],
            'hip': ['LEG_RAISE', 'SQUAT', 'STANDING_BALANCE'],
            'gait': ['WALKING_PRACTICE', 'LEG_RAISE', 'STANDING_BALANCE'],
            'coordination': ['ARM_STRETCH', 'STANDING_BALANCE', 'NECK_ROTATION']
        }
        
        # Extract patient demographics
        age_match = re.search(r'age[:\s]+(\d+)', medical_text)
        age = int(age_match.group(1)) if age_match else 50
        
        # Extract severity indicators
        severity_keywords = ['severe', 'moderate', 'mild', 'slight']
        severity_scores = {'severe': 1, 'moderate': 2, 'mild': 3, 'slight': 4}
        severity = 3  # default moderate
        
        for keyword in severity_keywords:
            if keyword in medical_text:
                severity = severity_scores[keyword]
                break
        
        # Find relevant conditions and recommended exercises
        recommended_exercises = set()
        condition_scores = {}
        
        for condition, exercises in condition_exercise_mapping.items():
            if condition in medical_text:
                condition_scores[condition] = medical_text.count(condition)
                recommended_exercises.update(exercises)
        
        # Extract specific limitations or contraindications
        limitations = []
        if 'no weight bearing' in medical_text:
            limitations.append('no_weight_bearing')
        if 'limited range' in medical_text or 'restricted movement' in medical_text:
            limitations.append('limited_range')
        if 'pain' in medical_text:
            limitations.append('pain_present')
        
        # Determine functional level
        functional_indicators = {
            'independent': 4,
            'minimal assistance': 3,
            'moderate assistance': 2,
            'maximum assistance': 1,
            'dependent': 1
        }
        
        functional_level = 3  # default
        for indicator, score in functional_indicators.items():
            if indicator in medical_text:
                functional_level = score
                break
        
        return {
            'age': age,
            'severity': severity,
            'functional_level': functional_level,
            'recommended_exercises': list(recommended_exercises),
            'condition_scores': condition_scores,
            'limitations': limitations,
            'medical_text_length': len(medical_text),
            'medical_keywords_count': sum(condition_scores.values())
        }
    
    def create_training_data(self) -> pd.DataFrame:
        """Create synthetic training data for exercise recommendation"""
        np.random.seed(42)
        
        # Sample medical conditions and their typical exercise recommendations
        conditions_data = [
            # Stroke patients
            {'condition': 'stroke', 'age': 65, 'severity': 2, 'functional_level': 2, 'exercises': ['ARM_STRETCH', 'SHOULDER_RAISE', 'STANDING_BALANCE']},
            {'condition': 'stroke', 'age': 72, 'severity': 1, 'functional_level': 1, 'exercises': ['ARM_STRETCH', 'LEFT_ARM_RAISE']},
            {'condition': 'stroke', 'age': 58, 'severity': 3, 'functional_level': 3, 'exercises': ['SHOULDER_RAISE', 'LEG_RAISE', 'WALKING_PRACTICE']},
            
            # Shoulder conditions
            {'condition': 'shoulder', 'age': 45, 'severity': 3, 'functional_level': 4, 'exercises': ['SHOULDER_RAISE', 'ARM_STRETCH']},
            {'condition': 'shoulder', 'age': 62, 'severity': 2, 'functional_level': 3, 'exercises': ['ARM_STRETCH', 'LEFT_ARM_RAISE', 'RIGHT_ARM_RAISE']},
            
            # Mobility issues
            {'condition': 'mobility', 'age': 78, 'severity': 2, 'functional_level': 2, 'exercises': ['STANDING_BALANCE', 'LEG_RAISE']},
            {'condition': 'mobility', 'age': 56, 'severity': 3, 'functional_level': 4, 'exercises': ['WALKING_PRACTICE', 'SQUAT', 'LEG_RAISE']},
            
            # Balance issues
            {'condition': 'balance', 'age': 70, 'severity': 2, 'functional_level': 3, 'exercises': ['STANDING_BALANCE', 'LEG_RAISE']},
            {'condition': 'balance', 'age': 82, 'severity': 1, 'functional_level': 1, 'exercises': ['STANDING_BALANCE']},
        ]
        
        training_data = []
        
        # Generate expanded training data
        for _ in range(800):  # Generate more samples
            base_condition = np.random.choice(conditions_data)
            
            # Add some variation
            age_variation = np.random.randint(-10, 11)
            age = max(18, min(90, base_condition['age'] + age_variation))
            
            severity = max(1, min(4, base_condition['severity'] + np.random.randint(-1, 2)))
            functional_level = max(1, min(4, base_condition['functional_level'] + np.random.randint(-1, 2)))
            
            # Select exercises from the base condition with some randomization
            available_exercises = base_condition['exercises'].copy()
            if len(available_exercises) > 1 and np.random.random() < 0.3:
                # Sometimes remove an exercise
                available_exercises.pop(np.random.randint(len(available_exercises)))
            
            if np.random.random() < 0.2:
                # Sometimes add a related exercise
                all_exercise_names = list(self.get_default_exercises().keys())
                additional = np.random.choice(all_exercise_names)
                if additional not in available_exercises:
                    available_exercises.append(additional)
            
            # Generate parameters for each exercise
            for exercise in available_exercises:
                # Calculate base parameters
                base_sets = max(1, int(4 - severity + functional_level * 0.5))
                base_reps = max(5, int(12 + functional_level * 2 - severity))
                base_duration = max(15, int(45 + functional_level * 5 - (age - 50) / 4))
                
                # Add variation
                sets = max(1, min(5, base_sets + np.random.randint(-1, 2)))
                reps = max(5, min(25, base_reps + np.random.randint(-3, 4)))
                duration = max(10, min(180, base_duration + np.random.randint(-15, 16)))
                
                training_data.append({
                    'condition': base_condition['condition'],
                    'age': age,
                    'severity': severity,
                    'functional_level': functional_level,
                    'exercise_name': exercise,
                    'is_recommended': 1,
                    'sets': sets,
                    'reps': reps,
                    'duration': duration
                })
                
                # Add some negative examples (exercises not recommended for this condition)
                if np.random.random() < 0.3:
                    all_exercises = list(self.get_default_exercises().keys())
                    non_recommended = [ex for ex in all_exercises if ex not in available_exercises]
                    if non_recommended:
                        neg_exercise = np.random.choice(non_recommended)
                        training_data.append({
                            'condition': base_condition['condition'],
                            'age': age,
                            'severity': severity,
                            'functional_level': functional_level,
                            'exercise_name': neg_exercise,
                            'is_recommended': 0,
                            'sets': 1,  # minimal values for non-recommended
                            'reps': 5,
                            'duration': 15
                        })
        
        return pd.DataFrame(training_data)
    
    def train_models(self) -> None:
        """Train ML models for exercise recommendation and parameter prediction"""
        logger.info("Creating training data and training ML models...")
        
        # Create training data
        df = self.create_training_data()
        
        # Prepare features
        categorical_features = ['condition', 'exercise_name']
        numerical_features = ['age', 'severity', 'functional_level']
        
        # Encode categorical features
        for feature in categorical_features:
            le = LabelEncoder()
            df[f'{feature}_encoded'] = le.fit_transform(df[feature].astype(str))
            self.label_encoders[feature] = le
        
        # Prepare feature matrix
        feature_columns = [f'{f}_encoded' for f in categorical_features] + numerical_features
        X = df[feature_columns].values
        X_scaled = self.scaler.fit_transform(X)
        
        # Train recommendation model (classification)
        y_recommend = df['is_recommended']
        X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_recommend, test_size=0.2, random_state=42)
        
        self.recommendation_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.recommendation_model.fit(X_train, y_train)
        
        # Evaluate recommendation model
        y_pred = self.recommendation_model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        logger.info(f"Recommendation model accuracy: {accuracy:.3f}")
        
        # Train parameter models (regression) - only on recommended exercises
        recommended_df = df[df['is_recommended'] == 1]
        X_rec = self.scaler.transform(recommended_df[feature_columns].values)
        
        self.parameter_models = {}
        for target in ['sets', 'reps', 'duration']:
            y = recommended_df[target]
            X_train, X_test, y_train, y_test = train_test_split(X_rec, y, test_size=0.2, random_state=42)
            
            model = RandomForestRegressor(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)
            
            y_pred = model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            logger.info(f"Parameter model for {target} - MSE: {mse:.2f}")
            
            self.parameter_models[target] = model
    
    def recommend_exercises_from_medical_report(self, medical_pdf_path: str, exercises_file: str = "exercises.txt") -> Dict:
        """Main function: recommend exercises based on medical PDF report"""
        
        # Load available exercises
        self.load_available_exercises(exercises_file)
        
        # Train models if not already trained
        if not self.recommendation_model:
            self.train_models()
        
        # Read and process medical PDF
        medical_text = self.read_medical_pdf(medical_pdf_path)
        if not medical_text:
            logger.error("Could not read medical PDF")
            return {}
        
        # Extract medical features
        medical_features = self.extract_medical_features(medical_text)
        logger.info(f"Extracted features: {medical_features}")
        
        # Get exercise recommendations
        recommended_exercises = self.predict_exercise_recommendations(medical_features)
        
        # Generate final JSON output
        result = {
            'patient_summary': {
                'age': medical_features.get('age', 'Unknown'),
                'severity_level': medical_features.get('severity', 'Unknown'),
                'functional_level': medical_features.get('functional_level', 'Unknown'),
                'identified_conditions': list(medical_features.get('condition_scores', {}).keys()),
                'limitations': medical_features.get('limitations', [])
            },
            'medical_analysis': {
                'text_length': medical_features.get('medical_text_length', 0),
                'keywords_found': medical_features.get('medical_keywords_count', 0),
                'primary_conditions': medical_features.get('condition_scores', {})
            },
            'available_exercises_count': len(self.available_exercises),
            'recommended_exercises': recommended_exercises,
            'total_recommendations': len(recommended_exercises)
        }
        
        return result
    
    def predict_exercise_recommendations(self, medical_features: Dict) -> Dict:
        """Predict which exercises to recommend and their parameters"""
        recommendations = {}
        
        # Determine primary condition for modeling
        condition_scores = medical_features.get('condition_scores', {})
        primary_condition = max(condition_scores.keys()) if condition_scores else 'general'
        
        # Check each available exercise
        for exercise_name, exercise_data in self.available_exercises.items():
            
            # Prepare input for models
            input_data = {
                'condition': primary_condition,
                'exercise_name': exercise_name,
                'age': medical_features.get('age', 50),
                'severity': medical_features.get('severity', 3),
                'functional_level': medical_features.get('functional_level', 3)
            }
            
            # Encode categorical features
            encoded_features = []
            for feature in ['condition', 'exercise_name']:
                if feature in self.label_encoders:
                    try:
                        encoded_val = self.label_encoders[feature].transform([str(input_data[feature])])[0]
                    except ValueError:
                        # Handle unknown categories
                        encoded_val = 0
                    encoded_features.append(encoded_val)
                else:
                    encoded_features.append(0)
            
            # Add numerical features
            numerical_features = [input_data['age'], input_data['severity'], input_data['functional_level']]
            
            # Combine all features
            X = np.array([encoded_features + numerical_features])
            X_scaled = self.scaler.transform(X)
            
            # Predict if exercise should be recommended
            recommendation_prob = self.recommendation_model.predict_proba(X_scaled)[0][1]  # Probability of being recommended
            
            # Use threshold for recommendation
            if recommendation_prob > 0.5:
                # Predict parameters
                parameters = {}
                for param_name, model in self.parameter_models.items():
                    pred_value = model.predict(X_scaled)[0]
                    
                    if param_name == 'sets':
                        parameters['sets'] = max(1, int(round(pred_value)))
                    elif param_name == 'reps':
                        parameters['reps_per_set'] = max(5, int(round(pred_value)))
                    elif param_name == 'duration':
                        parameters['duration_seconds'] = max(10, int(round(pred_value)))
                
                # Adjust based on limitations
                parameters = self.adjust_for_limitations(parameters, medical_features.get('limitations', []))
                
                recommendations[exercise_name] = {
                    'exercise_data': exercise_data,
                    'recommendation_confidence': float(recommendation_prob),
                    'parameters': parameters,
                    'rationale': self.generate_rationale(exercise_name, primary_condition, medical_features)
                }
        
        return recommendations
    
    def adjust_for_limitations(self, parameters: Dict, limitations: List) -> Dict:
        """Adjust exercise parameters based on patient limitations"""
        adjusted = parameters.copy()
        
        if 'pain_present' in limitations:
            adjusted['sets'] = max(1, adjusted.get('sets', 2) - 1)
            adjusted['reps_per_set'] = max(5, int(adjusted.get('reps_per_set', 10) * 0.8))
            adjusted['duration_seconds'] = max(10, int(adjusted.get('duration_seconds', 30) * 0.8))
        
        if 'limited_range' in limitations:
            adjusted['reps_per_set'] = max(5, int(adjusted.get('reps_per_set', 10) * 0.9))
        
        if 'no_weight_bearing' in limitations:
            # These exercises might need modification or exclusion
            adjusted['sets'] = max(1, adjusted.get('sets', 2))
        
        # Add rest periods and progression notes
        adjusted['rest_between_sets_seconds'] = 45 if 'pain_present' in limitations else 30
        adjusted['frequency_per_week'] = min(5, max(2, adjusted.get('sets', 2)))
        
        return adjusted
    
    def generate_rationale(self, exercise_name: str, condition: str, medical_features: Dict) -> str:
        """Generate rationale for why an exercise was recommended"""
        rationales = {
            'SHOULDER_RAISE': f"Recommended to improve shoulder mobility and strength, particularly beneficial for {condition} recovery.",
            'ARM_STRETCH': f"Selected to enhance range of motion and flexibility, addressing limitations commonly seen in {condition}.",
            'STANDING_BALANCE': f"Important for improving balance and postural stability, crucial for functional independence in {condition}.",
            'LEG_RAISE': f"Targets leg strength and mobility, supporting overall functional movement in {condition} rehabilitation.",
            'WALKING_PRACTICE': f"Essential for gait training and mobility improvement, directly addressing functional limitations in {condition}.",
            'SQUAT': f"Strengthens lower body muscles and improves functional movement patterns for {condition} recovery.",
            'NECK_ROTATION': f"Addresses neck mobility and posture, supporting overall movement quality in {condition} management."
        }
        
        base_rationale = rationales.get(exercise_name, f"Recommended based on therapeutic benefits for {condition} management.")
        
        # Add severity-based modifications
        severity = medical_features.get('severity', 3)
        if severity <= 2:
            base_rationale += " Modified for current severity level with reduced intensity."
        elif severity >= 4:
            base_rationale += " Can be progressed as tolerance improves."
        
        return base_rationale
    
    def save_models(self, model_path: str) -> None:
        """Save trained models"""
        model_data = {
            'recommendation_model': self.recommendation_model,
            'parameter_models': self.parameter_models,
            'text_vectorizer': self.text_vectorizer,
            'label_encoders': self.label_encoders,
            'scaler': self.scaler,
            'available_exercises': self.available_exercises
        }
        
        with open(model_path, 'wb') as f:
            pickle.dump(model_data, f)
        logger.info(f"Models saved to {model_path}")
    
    def load_models(self, model_path: str) -> None:
        """Load trained models"""
        try:
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            self.recommendation_model = model_data['recommendation_model']
            self.parameter_models = model_data['parameter_models']
            self.text_vectorizer = model_data['text_vectorizer']
            self.label_encoders = model_data['label_encoders']
            self.scaler = model_data['scaler']
            self.available_exercises = model_data.get('available_exercises', {})
            
            logger.info(f"Models loaded from {model_path}")
        except Exception as e:
            logger.error(f"Error loading models: {e}")

def create_sample_medical_report():
    """Create a sample medical PDF report for testing"""
    sample_report = """
MEDICAL REHABILITATION REPORT

Patient: John Doe
Age: 67
Date: January 15, 2025

DIAGNOSIS:
- Post-stroke hemiparesis, right side affected
- Moderate shoulder weakness, right upper extremity
- Mild balance deficits
- Limited range of motion in right arm

ASSESSMENT:
The patient presents with moderate functional limitations following stroke. 
Right arm shows significant weakness with limited shoulder abduction and elbow extension.
Balance is impaired with minimal assistance required for standing activities.
Patient demonstrates good motivation and cognitive function.

FUNCTIONAL STATUS:
- Mobility: Requires moderate assistance for ambulation
- Upper extremity: Right arm weakness, left arm functional
- Balance: Standing balance impaired, requires supervision
- ADLs: Requires minimal to moderate assistance

RECOMMENDATIONS:
- Physical therapy focusing on upper extremity strengthening
- Balance training exercises
- Range of motion exercises for shoulder and arm
- Progressive mobility training
- Continue current medications

GOALS:
- Improve right upper extremity strength and range of motion
- Enhance standing balance and postural control
- Increase independence in daily activities
- Progress to independent ambulation

PRECAUTIONS:
- Monitor for pain during exercises
- Avoid overexertion
- Ensure safety during balance activities
- Progress gradually based on tolerance

THERAPY PLAN:
Duration: 6-8 weeks
Frequency: 3x per week
Focus areas: Upper extremity, balance, mobility
"""
    
    # Save as text file (in real scenario, you'd convert to PDF)
    with open("sample_medical_report.txt", "w") as f:
        f.write(sample_report)
    
    print("Sample medical report created as 'sample_medical_report.txt'")
    print("Note: In practice, this would be a PDF file from the medical system")

def create_sample_exercises_file():
    """Create a sample exercises.txt file"""
    sample_content = """# Exercise Configuration File
# Format: EXERCISE_NAME
# RULE: joint1,joint2,joint3|min_angle,max_angle|description|weight

SHOULDER_RAISE
RULE: left_shoulder,left_elbow,left_wrist|160,180|Left arm should be straight up|1.5
RULE: right_shoulder,right_elbow,right_wrist|160,180|Right arm should be straight up|1.5
RULE: left_shoulder,nose,right_shoulder|170,190|Keep shoulders level|1.0

LEFT_ARM_RAISE
RULE: left_shoulder,left_elbow,left_wrist|160,180|Left arm should be fully extended|2.0
RULE: left_hip,left_shoulder,left_elbow|80,100|Left arm should be raised to shoulder height or above|2.5
RULE: left_shoulder,nose,right_shoulder|165,195|Keep shoulders level - don't lean|1.5
RULE: right_shoulder,right_elbow,right_wrist|160,200|Right arm should remain relaxed at side|1.0
RULE: right_hip,right_shoulder,right_elbow|160,200|Right arm should stay down|1.2

RIGHT_ARM_RAISE
RULE: right_shoulder,right_elbow,right_wrist|160,180|Right arm should be fully extended|2.0
RULE: right_hip,right_shoulder,right_elbow|80,100|Right arm should be raised to shoulder height or above|2.5
RULE: left_shoulder,nose,right_shoulder|165,195|Keep shoulders level - don't lean|1.5
RULE: left_shoulder,left_elbow,left_wrist|160,200|Left arm should remain relaxed at side|1.0
RULE: left_hip,left_shoulder,left_elbow|160,200|Left arm should stay down|1.2

SQUAT
RULE: left_hip,left_knee,left_ankle|80,110|Left knee bent at proper angle|2.0
RULE: right_hip,right_knee,right_ankle|80,110|Right knee bent at proper angle|2.0
RULE: left_shoulder,left_hip,left_knee|160,190|Keep back straight|1.5

ARM_STRETCH
RULE: left_shoulder,left_elbow,left_wrist|170,190|Left arm should be extended|1.0
RULE: right_shoulder,right_elbow,right_wrist|170,190|Right arm should be extended|1.0
RULE: left_wrist,left_shoulder,right_shoulder|85,95|Arms should be perpendicular to body|1.2

STANDING_BALANCE
RULE: left_shoulder,left_hip,left_knee|170,190|Maintain upright posture|1.5
RULE: right_shoulder,right_hip,right_knee|170,190|Maintain upright posture|1.5
RULE: left_shoulder,nose,right_shoulder|170,190|Keep shoulders level|1.0

NECK_ROTATION
RULE: left_ear,nose,right_ear|160,200|Keep head aligned|1.0
RULE: left_shoulder,nose,right_shoulder|170,190|Keep shoulders stable|1.2

LEG_RAISE
RULE: left_hip,left_knee,left_ankle|160,180|Left leg should be straight|1.8
RULE: right_hip,right_knee,right_ankle|160,200|Right leg should remain stable|1.0
RULE: left_shoulder,left_hip,left_knee|80,100|Raise leg to appropriate height|2.0

WALKING_PRACTICE
RULE: left_hip,left_knee,left_ankle|160,180|Left leg should be straight during stance|1.5
RULE: right_hip,right_knee,right_ankle|160,180|Right leg should be straight during stance|1.5
RULE: left_shoulder,left_hip,left_knee|170,190|Maintain upright posture|1.2

GRIP_STRENGTH
RULE: left_shoulder,left_elbow,left_wrist|170,190|Arm should be extended|1.0
RULE: right_shoulder,right_elbow,right_wrist|170,190|Arm should be extended|1.0
"""
    
    with open("exercises.txt", "w") as f:
        f.write(sample_content)
    
    print("Sample exercises.txt file created!")

from pdfminer.high_level import extract_text

def pdf_to_txt(input_pdf: str, output_txt: str) -> None:
    """
    Extract text from a text-based PDF and save it to a .txt file.
    """
    text = extract_text(input_pdf)
    with open(output_txt, "w", encoding="utf-8") as f:
        f.write(text)


def main():
    """Main function to demonstrate the system"""
    
    # Create sample files for testing
    print("Setting up sample files...")
    # create_sample_exercises_file()
    # create_sample_medical_report()
    
    # Initialize the recommendation system
    print("\nInitializing Medical Exercise Recommendation System...")
    recommender = MedicalExerciseRecommendationSystem()
    
    # Process medical report and generate recommendations
    print("Processing medical report and generating exercise recommendations...")
    
    # Note: In practice, this would be a PDF file
    # For demo, we'll use the text file as if it were extracted from PDF
    from pdfminer.high_level import extract_text

    pdf_to_txt("Report_001.pdf", "medical_report.txt")


    medical_file = "medical_report.txt"  # This simulates a PDF extraction
    exercises_file = "exercises.txt"
    
    # Since we're using a text file instead of PDF, we'll modify the process slightly
    try:
        # Read the medical report (simulating PDF extraction)
        with open(medical_file, 'r') as f:
            medical_text = f.read()
        
        # Load available exercises
        recommender.load_available_exercises(exercises_file)
        
        # Train models
        recommender.train_models()
        
        # Extract medical features
        medical_features = recommender.extract_medical_features(medical_text)
        
        # Get recommendations
        recommendations = recommender.predict_exercise_recommendations(medical_features)
        
        # Create final result
        result = {
            'patient_summary': {
                'age': medical_features.get('age', 'Unknown'),
                'severity_level': medical_features.get('severity', 'Unknown'),
                'functional_level': medical_features.get('functional_level', 'Unknown'),
                'identified_conditions': list(medical_features.get('condition_scores', {}).keys()),
                'limitations': medical_features.get('limitations', [])
            },
            'medical_analysis': {
                'text_length': medical_features.get('medical_text_length', 0),
                'keywords_found': medical_features.get('medical_keywords_count', 0),
                'primary_conditions': medical_features.get('condition_scores', {})
            },
            'available_exercises_count': len(recommender.available_exercises),
            'recommended_exercises': recommendations,
            'total_recommendations': len(recommendations)
        }
        
        # Save results
        output_file = "medical_exercise_recommendations.json"
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        
        # Save models for future use
        recommender.save_models("medical_exercise_models.pkl")
        
        # Display results
        print(f"\n{'='*50}")
        print("MEDICAL EXERCISE RECOMMENDATION RESULTS")
        print(f"{'='*50}")
        
        print(f"\nPatient Summary:")
        print(f"  Age: {result['patient_summary']['age']}")
        print(f"  Conditions Identified: {', '.join(result['patient_summary']['identified_conditions'])}")
        print(f"  Functional Level: {result['patient_summary']['functional_level']}/4")
        print(f"  Limitations: {', '.join(result['patient_summary']['limitations']) if result['patient_summary']['limitations'] else 'None detected'}")
        
        print(f"\nRecommended Exercises ({result['total_recommendations']} total):")
        print(f"{'='*50}")
        
        for exercise_name, exercise_info in recommendations.items():
            params = exercise_info['parameters']
            confidence = exercise_info['recommendation_confidence']
            
            print(f"\n{exercise_name}:")
            print(f"  Confidence: {confidence:.1%}")
            print(f"  Sets: {params.get('sets', 'N/A')}")
            print(f"  Reps per Set: {params.get('reps_per_set', 'N/A')}")
            print(f"  Duration: {params.get('duration_seconds', 'N/A')} seconds")
            print(f"  Frequency: {params.get('frequency_per_week', 'N/A')} times/week")
            print(f"  Rest: {params.get('rest_between_sets_seconds', 'N/A')} seconds between sets")
            print(f"  Rationale: {exercise_info['rationale']}")
        
        print(f"\nResults saved to: {output_file}")
        print(f"Models saved to: medical_exercise_models.pkl")
        
        # Display sample exercise rules
        if recommendations:
            sample_exercise = list(recommendations.keys())[0]
            exercise_data = recommendations[sample_exercise]['exercise_data']
            print(f"\nSample Exercise Rules for {sample_exercise}:")
            for i, rule in enumerate(exercise_data['rules'], 1):
                print(f"  Rule {i}: {rule['description']}")
                print(f"    Joints: {', '.join(rule['joints'])}")
                print(f"    Angle Range: {rule['min_angle']}-{rule['max_angle']} degrees")
                print(f"    Weight: {rule['weight']}")
        
    except Exception as e:
        logger.error(f"Error in main execution: {e}")
        print(f"Error: {e}")

if __name__ == "__main__":
    main()