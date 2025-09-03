import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

type Landmark = {
  x: number;
  y: number;
  z: number;
  visibility: number;
};

interface PaperDollProps {
  landmarks: Landmark[];
}

/**
 * MediaPipe Pose landmark connections for a complete human figure
 */
const POSE_CONNECTIONS: [number, number][] = [
  // Face outline
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  
  // Shoulders and torso
  [11, 12], // shoulder line
  [11, 23], [12, 24], // shoulder to hip
  [23, 24], // hip line
  
  // Left arm
  [11, 13], [13, 15], // shoulder to wrist
  [15, 17], [15, 19], [15, 21], // hand connections
  
  // Right arm  
  [12, 14], [14, 16], // shoulder to wrist
  [16, 18], [16, 20], [16, 22], // hand connections
  
  // Left leg
  [23, 25], [25, 27], [27, 29], // hip to ankle
  [27, 31], [29, 31], // foot connections
  
  // Right leg
  [24, 26], [26, 28], [28, 30], // hip to ankle
  [28, 32], [30, 32], // foot connections
];

const PaperDoll: React.FC<PaperDollProps> = ({ landmarks }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const frameRef = useRef<number>();

  // Scale and transform landmarks for better visualization
  const scaledLandmarks = useMemo(() => {
    if (!landmarks || landmarks.length === 0) {
      // Return default pose if no landmarks provided
      return [
        { x: 0, y: 4, z: 0, visibility: 1 }, // head
        { x: 0, y: 3.5, z: 0, visibility: 1 },
        { x: 0, y: 3.5, z: 0, visibility: 1 },
        { x: 0, y: 3.5, z: 0, visibility: 1 },
        { x: 0, y: 3.5, z: 0, visibility: 1 },
        { x: 0, y: 3.5, z: 0, visibility: 1 },
        { x: 0, y: 3.5, z: 0, visibility: 1 },
        { x: 0, y: 3.5, z: 0, visibility: 1 },
        { x: 0, y: 3.5, z: 0, visibility: 1 },
        { x: 0, y: 3, z: 0, visibility: 1 },
        { x: 0, y: 3, z: 0, visibility: 1 },
        { x: -1, y: 2, z: 0, visibility: 1 }, // left shoulder
        { x: 1, y: 2, z: 0, visibility: 1 }, // right shoulder
        { x: -1.5, y: 1, z: 0, visibility: 1 }, // left elbow
        { x: 1.5, y: 1, z: 0, visibility: 1 }, // right elbow
        { x: -2, y: 0, z: 0, visibility: 1 }, // left wrist
        { x: 2, y: 0, z: 0, visibility: 1 }, // right wrist
        { x: -2.2, y: -0.2, z: 0, visibility: 0.8 }, // left hand
        { x: 2.2, y: -0.2, z: 0, visibility: 0.8 },
        { x: -2.2, y: -0.1, z: 0, visibility: 0.8 },
        { x: 2.2, y: -0.1, z: 0, visibility: 0.8 },
        { x: -2.2, y: 0, z: 0, visibility: 0.8 },
        { x: 2.2, y: 0, z: 0, visibility: 0.8 },
        { x: -0.8, y: 0, z: 0, visibility: 1 }, // left hip
        { x: 0.8, y: 0, z: 0, visibility: 1 }, // right hip
        { x: -1, y: -2, z: 0, visibility: 1 }, // left knee
        { x: 1, y: -2, z: 0, visibility: 1 }, // right knee
        { x: -1, y: -4, z: 0, visibility: 1 }, // left ankle
        { x: 1, y: -4, z: 0, visibility: 1 }, // right ankle
        { x: -1.2, y: -4.3, z: 0, visibility: 1 }, // left foot
        { x: 1.2, y: -4.3, z: 0, visibility: 1 }, // right foot
        { x: -0.8, y: -4.2, z: 0, visibility: 1 },
        { x: 0.8, y: -4.2, z: 0, visibility: 1 }
      ];
    }
    
    return landmarks.map((lm) => ({
      x: (lm.x - 0.5) * 8,
      y: -(lm.y - 0.5) * 10,
      z: lm.z * 3,
      visibility: lm.visibility,
    }));
  }, [landmarks]);

  // Filter connections to only show visible landmarks
  const visibleConnections = useMemo(() => {
    return POSE_CONNECTIONS.filter(([start, end]) => {
      const startLm = scaledLandmarks[start];
      const endLm = scaledLandmarks[end];
      return (
        startLm && 
        endLm && 
        startLm.visibility > 0.1 && 
        endLm.visibility > 0.1
      );
    });
  }, [scaledLandmarks]);

  // Create body parts with realistic proportions
  const createBodyPart = (start: THREE.Vector3, end: THREE.Vector3, radius: number, color: number) => {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 12);
    const material = new THREE.MeshStandardMaterial({ 
      color: color,
      metalness: 0.1,
      roughness: 0.8
    });
    
    const cylinder = new THREE.Mesh(geometry, material);
    
    // Position and orient the cylinder
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    cylinder.position.copy(midpoint);
    
    // Orient cylinder towards the end point
    cylinder.lookAt(end);
    cylinder.rotateX(Math.PI / 2);
    
    return cylinder;
  };

  const createJoint = (position: THREE.Vector3, radius: number, color: number) => {
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshStandardMaterial({ 
      color: color,
      metalness: 0.2,
      roughness: 0.7
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(position);
    return sphere;
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Add subtle fog for depth
    scene.fog = new THREE.Fog(0xf0f0f0, 10, 50);

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      50,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 15);
    cameraRef.current = camera;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Enhanced lighting for realistic appearance
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 15, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Add ground plane
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create realistic human figure
    const bodyGroup = new THREE.Group();
    
    // Skin tone colors
    const skinColor = 0xfdbcb4;
    const clothingColor = 0x4a90a4;
    const jointColor = 0xe8b4a4;

    // Create body parts with proper proportions
    const bodyParts: THREE.Mesh[] = [];
    const joints: THREE.Mesh[] = [];

    // Head
    if (scaledLandmarks[0] && scaledLandmarks[0].visibility > 0.1) {
      const headPos = new THREE.Vector3(scaledLandmarks[0].x, scaledLandmarks[0].y, scaledLandmarks[0].z);
      const head = createJoint(headPos, 1.4, skinColor);
      head.castShadow = true;
      bodyParts.push(head);
    }

    // Torso (chest to hips)
    const leftShoulder = scaledLandmarks[11];
    const rightShoulder = scaledLandmarks[12];
    const leftHip = scaledLandmarks[23];
    const rightHip = scaledLandmarks[24];

    if (leftShoulder?.visibility > 0.1 && rightShoulder?.visibility > 0.1) {
      const chestCenter = new THREE.Vector3(
        (leftShoulder.x + rightShoulder.x) / 2,
        (leftShoulder.y + rightShoulder.y) / 2,
        (leftShoulder.z + rightShoulder.z) / 2
      );

      if (leftHip?.visibility > 0.1 && rightHip?.visibility > 0.1) {
        const hipCenter = new THREE.Vector3(
          (leftHip.x + rightHip.x) / 2,
          (leftHip.y + rightHip.y) / 2,
          (leftHip.z + rightHip.z) / 2
        );

        const torso = createBodyPart(chestCenter, hipCenter, 0.6, clothingColor);
        torso.castShadow = true;
        bodyParts.push(torso);
      }
    }

    // Arms and legs
    const limbs = [
      // Left arm: shoulder -> elbow -> wrist
      [11, 13, 15],
      // Right arm: shoulder -> elbow -> wrist  
      [12, 14, 16],
      // Left leg: hip -> knee -> ankle
      [23, 25, 27],
      // Right leg: hip -> knee -> ankle
      [24, 26, 28]
    ];

    limbs.forEach((limb, limbIndex) => {
      for (let i = 0; i < limb.length - 1; i++) {
        const startLm = scaledLandmarks[limb[i]];
        const endLm = scaledLandmarks[limb[i + 1]];
        
        if (startLm?.visibility > 0.1 && endLm?.visibility > 0.1) {
          const start = new THREE.Vector3(startLm.x, startLm.y, startLm.z);
          const end = new THREE.Vector3(endLm.x, endLm.y, endLm.z);
          
          // Different radius for different body parts
          let radius = 0.15;
          let color = skinColor;
          
          if (limbIndex < 2) { // arms
            radius = i === 0 ? 0.2 : 0.15; // upper arm thicker than forearm
            color = i === 0 ? clothingColor : skinColor;
          } else { // legs
            radius = i === 0 ? 0.25 : 0.18; // thigh thicker than shin
            color = clothingColor;
          }
          
          const bodyPart = createBodyPart(start, end, radius, color);
          bodyPart.castShadow = true;
          bodyParts.push(bodyPart);
          
          // Add joints
          const joint = createJoint(start, radius * 0.8, jointColor);
          joint.castShadow = true;
          joints.push(joint);
        }
      }
    });

    // Add all body parts to the group
    bodyParts.forEach(part => bodyGroup.add(part));
    joints.forEach(joint => bodyGroup.add(joint));

    scene.add(bodyGroup);

    // Mouse controls
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let isMouseDown = false;

    const handleMouseMove = (event: MouseEvent) => {
      if (isMouseDown) {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        targetRotationX = mouseY * 0.5;
        targetRotationY = mouseX * 0.5;
      }
    };

    const handleMouseDown = () => {
      isMouseDown = true;
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grabbing';
      }
    };

    const handleMouseUp = () => {
      isMouseDown = false;
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grab';
      }
    };

    const handleWheel = (event: WheelEvent) => {
      camera.position.z += event.deltaY * 0.02;
      camera.position.z = Math.max(8, Math.min(50, camera.position.z));
    };

    if (canvasRef.current) {
      canvasRef.current.addEventListener('mousemove', handleMouseMove);
      canvasRef.current.addEventListener('mousedown', handleMouseDown);
      canvasRef.current.addEventListener('mouseup', handleMouseUp);
      canvasRef.current.addEventListener('wheel', handleWheel);
    }

    // Animation loop
    const animate = () => {
      // Smooth rotation
      bodyGroup.rotation.x += (targetRotationX - bodyGroup.rotation.x) * 0.1;
      bodyGroup.rotation.y += (targetRotationY - bodyGroup.rotation.y) * 0.1;

      // Gentle auto-rotation when not interacting
      if (!isMouseDown) {
        bodyGroup.rotation.y += 0.003;
      }

      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('mousemove', handleMouseMove);
        canvasRef.current.removeEventListener('mousedown', handleMouseDown);
        canvasRef.current.removeEventListener('mouseup', handleMouseUp);
        canvasRef.current.removeEventListener('wheel', handleWheel);
      }
      renderer.dispose();
    };
  }, [scaledLandmarks, visibleConnections]);

  return (
    <canvas 
      ref={canvasRef}
      className="w-full h-full"
      style={{ cursor: 'grab' }}
    />
  );
};

export default PaperDoll;