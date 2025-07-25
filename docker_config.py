#!/usr/bin/env python3
"""
Docker Configuration Generator for BookingSmart Platform
This script generates Docker Compose files with custom configurations
"""

import os
import json
import argparse
from typing import Dict, Any
from pathlib import Path

class DockerConfigGenerator:
    """Generate Docker configurations for different environments"""
    
    def __init__(self, username: str = "phamduyhuyuit", version: str = "latest"):
        self.username = username
        self.version = version
        
        self.services = [
            "discovery-service",
            "booking-service", 
            "flight-service",
            "hotel-service",
            "payment-service",
            "customer-service",
            "notification-service",
            "media-service",
            "transport-service",
            "storefront-bff",
            "backoffice-bff",
            "storefront-fe",
            "backoffice-fe"
        ]
    
    def generate_production_compose(self) -> Dict[str, Any]:
        """Generate production docker-compose override"""
        config = {
            "version": "3.8",
            "services": {}
        }
        
        for service in self.services:
            config["services"][service] = {
                "image": f"{self.username}/bookingsmart-{service}:{self.version}",
                "build": None  # Override build context
            }
        
        return config
    
    def generate_kubernetes_manifests(self) -> Dict[str, str]:
        """Generate Kubernetes deployment manifests"""
        manifests = {}
        
        for service in self.services:
            # Determine service type
            if service.endswith("-fe"):
                service_type = "frontend"
                port = 3000
            elif service.endswith("-bff"):
                service_type = "bff"
                port = 8080
            elif service == "discovery-service":
                service_type = "discovery"
                port = 8761
            else:
                service_type = "backend"
                port = 8080
            
            manifest = f"""apiVersion: apps/v1
kind: Deployment
metadata:
  name: {service}
  labels:
    app: {service}
    type: {service_type}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: {service}
  template:
    metadata:
      labels:
        app: {service}
    spec:
      containers:
      - name: {service}
        image: {self.username}/bookingsmart-{service}:{self.version}
        ports:
        - containerPort: {port}
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: {service}-service
spec:
  selector:
    app: {service}
  ports:
  - protocol: TCP
    port: 80
    targetPort: {port}
  type: ClusterIP
"""
            manifests[f"{service}.yaml"] = manifest
        
        return manifests
    
    def generate_docker_stack(self) -> Dict[str, Any]:
        """Generate Docker Swarm stack file"""
        config = {
            "version": "3.8",
            "services": {}
        }
        
        for service in self.services:
            service_config = {
                "image": f"{self.username}/bookingsmart-{service}:{self.version}",
                "deploy": {
                    "replicas": 1,
                    "restart_policy": {
                        "condition": "on-failure"
                    },
                    "resources": {
                        "limits": {
                            "memory": "512M"
                        },
                        "reservations": {
                            "memory": "256M"
                        }
                    }
                },
                "networks": ["booking-network"]
            }
            
            # Add port mapping for specific services
            if service.endswith("-fe"):
                service_config["ports"] = ["3000"]
            elif service == "discovery-service":
                service_config["ports"] = ["8761:8761"]
            elif service.endswith("-bff"):
                service_config["ports"] = ["8080"]
            
            config["services"][service] = service_config
        
        # Add networks
        config["networks"] = {
            "booking-network": {
                "driver": "overlay",
                "attachable": True
            }
        }
        
        return config
    
    def save_config(self, config: Dict[str, Any], filename: str):
        """Save configuration to YAML file"""
        yaml_content = self._dict_to_yaml(config)
        with open(filename, 'w') as f:
            f.write(yaml_content)
        print(f"Generated: {filename}")

    def _dict_to_yaml(self, data: Any, indent: int = 0) -> str:
        """Convert dictionary to YAML format without external dependencies"""
        if isinstance(data, dict):
            result = ""
            for key, value in data.items():
                if value is None:
                    result += "  " * indent + f"{key}: null\n"
                elif isinstance(value, (dict, list)):
                    result += "  " * indent + f"{key}:\n"
                    result += self._dict_to_yaml(value, indent + 1)
                elif isinstance(value, str):
                    result += "  " * indent + f"{key}: {value}\n"
                else:
                    result += "  " * indent + f"{key}: {value}\n"
            return result
        elif isinstance(data, list):
            result = ""
            for item in data:
                if isinstance(item, (dict, list)):
                    result += "  " * indent + "-\n"
                    result += self._dict_to_yaml(item, indent + 1)
                else:
                    result += "  " * indent + f"- {item}\n"
            return result
        else:
            return str(data)
    
    def save_manifests(self, manifests: Dict[str, str], output_dir: str = "k8s"):
        """Save Kubernetes manifests to files"""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        for filename, content in manifests.items():
            file_path = output_path / filename
            with open(file_path, 'w') as f:
                f.write(content)
            print(f"Generated: {file_path}")
    
    def generate_all(self):
        """Generate all configuration files"""
        print(f"Generating Docker configurations for {self.username}/bookingsmart-*:{self.version}")
        
        # Production Docker Compose
        prod_config = self.generate_production_compose()
        self.save_config(prod_config, "docker-compose.prod.yml")
        
        # Docker Swarm Stack
        stack_config = self.generate_docker_stack()
        self.save_config(stack_config, "docker-stack.yml")
        
        # Kubernetes Manifests
        k8s_manifests = self.generate_kubernetes_manifests()
        self.save_manifests(k8s_manifests)
        
        print("\nGenerated files:")
        print("  - docker-compose.prod.yml (Production Docker Compose)")
        print("  - docker-stack.yml (Docker Swarm Stack)")
        print("  - k8s/ (Kubernetes manifests)")
        
        print(f"\nUsage examples:")
        print(f"  Docker Compose: docker-compose -f docker-compose.yml -f docker-compose.prod.yml up")
        print(f"  Docker Swarm:   docker stack deploy -c docker-stack.yml bookingsmart")
        print(f"  Kubernetes:     kubectl apply -f k8s/")

def main():
    """Main function"""
    parser = argparse.ArgumentParser(
        description="Generate Docker configurations for BookingSmart Platform"
    )
    
    parser.add_argument("--username", "-u",
                       default="phamduyhuyuit",
                       help="Docker Hub username (default: phamduyhuyuit)")
    
    parser.add_argument("--version", "-v",
                       default="latest", 
                       help="Image version tag (default: latest)")
    
    parser.add_argument("--type", "-t",
                       choices=["all", "compose", "stack", "k8s"],
                       default="all",
                       help="Configuration type to generate (default: all)")
    
    args = parser.parse_args()
    
    generator = DockerConfigGenerator(args.username, args.version)
    
    if args.type == "all":
        generator.generate_all()
    elif args.type == "compose":
        config = generator.generate_production_compose()
        generator.save_config(config, "docker-compose.prod.yml")
    elif args.type == "stack":
        config = generator.generate_docker_stack()
        generator.save_config(config, "docker-stack.yml")
    elif args.type == "k8s":
        manifests = generator.generate_kubernetes_manifests()
        generator.save_manifests(manifests)

if __name__ == "__main__":
    main()
