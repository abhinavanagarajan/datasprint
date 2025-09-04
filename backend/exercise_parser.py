import json
from typing import Dict, List, Tuple
from dataclasses import dataclass
from enum import Enum
import os

@dataclass
class PostureRule:
    """Define a rule for correct posture."""
    joint1: str
    joint2: str
    joint3: str
    angle_range: Tuple[float, float]  # (min, max) acceptable angles
    description: str
    weight: float = 1.0  # Importance weight

class ExerciseParser:
    """Parse exercises from configuration files."""
    
    def __init__(self, config_file: str = "exercises.txt"):
        self.config_file = config_file
        self.exercises = {}
        self.load_exercises()
    
    def load_exercises(self):
        """Load exercises from the configuration file."""
        if not os.path.exists(self.config_file):
            self.create_default_config()
        
        try:
            with open(self.config_file, 'r') as f:
                content = f.read()
                self.exercises = self.parse_exercises(content)
        except Exception as e:
            print(f"Error loading exercises: {e}")
            self.exercises = {}
    
    def create_default_config(self):
        """Create a default exercise configuration file."""
        default_config = """
# Exercise Configuration File
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
"""
        
        with open(self.config_file, 'w') as f:
            f.write(default_config.strip())
        print(f"Created default exercise configuration: {self.config_file}")
    
    def parse_exercises(self, content: str) -> Dict[str, List[PostureRule]]:
        """Parse exercise configuration from text content."""
        exercises = {}
        current_exercise = None
        
        lines = content.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            
            # Skip empty lines and comments
            if not line or line.startswith('#'):
                continue
            
            # Check if this is an exercise name
            if not line.startswith('RULE:'):
                current_exercise = line.upper().replace(' ', '_')
                exercises[current_exercise] = []
            else:
                # Parse rule
                if current_exercise is None:
                    continue
                
                rule_content = line[5:].strip()  # Remove 'RULE:'
                try:
                    rule = self.parse_rule(rule_content)
                    if rule:
                        exercises[current_exercise].append(rule)
                except Exception as e:
                    print(f"Error parsing rule '{rule_content}': {e}")
        
        return exercises
    
    def parse_rule(self, rule_content: str) -> PostureRule:
        """Parse a single rule from text."""
        parts = rule_content.split('|')
        
        if len(parts) < 3:
            raise ValueError(f"Invalid rule format: {rule_content}")
        
        # Parse joints
        joints = parts[0].split(',')
        if len(joints) != 3:
            raise ValueError(f"Rule must have exactly 3 joints: {parts[0]}")
        
        # Parse angle range
        angles = parts[1].split(',')
        if len(angles) != 2:
            raise ValueError(f"Angle range must have min,max: {parts[1]}")
        
        min_angle = float(angles[0])
        max_angle = float(angles[1])
        
        # Parse description
        description = parts[2]
        
        # Parse weight (optional)
        weight = 1.0
        if len(parts) > 3:
            weight = float(parts[3])
        
        return PostureRule(
            joint1=joints[0].strip(),
            joint2=joints[1].strip(),
            joint3=joints[2].strip(),
            angle_range=(min_angle, max_angle),
            description=description.strip(),
            weight=weight
        )
    
    def get_exercise_names(self) -> List[str]:
        """Get list of available exercise names."""
        return list(self.exercises.keys())
    
    def get_exercise_rules(self, exercise_name: str) -> List[PostureRule]:
        """Get rules for a specific exercise."""
        return self.exercises.get(exercise_name.upper().replace(' ', '_'), [])
    
    def add_exercise(self, exercise_name: str, rules: List[PostureRule]):
        """Add a new exercise programmatically."""
        exercise_key = exercise_name.upper().replace(' ', '_')
        self.exercises[exercise_key] = rules
        self.save_exercises()
    
    def save_exercises(self):
        """Save current exercises back to the configuration file."""
        content_lines = ["# Exercise Configuration File"]
        content_lines.append("# Format: EXERCISE_NAME")
        content_lines.append("# RULE: joint1,joint2,joint3|min_angle,max_angle|description|weight")
        content_lines.append("")
        
        for exercise_name, rules in self.exercises.items():
            content_lines.append(exercise_name)
            for rule in rules:
                rule_line = f"RULE: {rule.joint1},{rule.joint2},{rule.joint3}|"
                rule_line += f"{rule.angle_range[0]},{rule.angle_range[1]}|"
                rule_line += f"{rule.description}|{rule.weight}"
                content_lines.append(rule_line)
            content_lines.append("")
        
        with open(self.config_file, 'w') as f:
            f.write('\n'.join(content_lines))
    
    def reload_exercises(self):
        """Reload exercises from the configuration file."""
        self.load_exercises()


if __name__ == "__main__":
    parser = ExerciseParser()
    print("Available exercises:", parser.get_exercise_names())
    
    # Get rules for a specific exercise
    rules = parser.get_exercise_rules("LEFT_ARM_RAISE")
    for rule in rules:
        print(f"- {rule.description}: {rule.angle_range}")