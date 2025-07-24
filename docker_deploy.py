#!/usr/bin/env python3
"""
Docker Hub Deployment Script for BookingSmart Platform
This script builds and pushes all services to Docker Hub
"""

import os
import sys
import subprocess
import argparse
import json
from typing import Dict, List, Tuple, Optional
from pathlib import Path
import time

class Colors:
    """ANSI color codes for terminal output"""
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    PURPLE = '\033[0;35m'
    CYAN = '\033[0;36m'
    WHITE = '\033[1;37m'
    NC = '\033[0m'  # No Color

class DockerDeployer:
    """Main class for Docker Hub deployment"""
    
    def __init__(self, username: str, version: str = "latest", registry: str = "docker.io"):
        self.username = username
        self.version = version
        self.registry = registry
        self.failed_services = []
        self.successful_services = []
        
        # Service configurations
        self.backend_services = {
            "discovery-service": ("discovery-service/Dockerfile", "discovery-service"),
            "booking-service": ("booking-service/Dockerfile", "booking-service"),
            "flight-service": ("flight-service/Dockerfile", "flight-service"),
            "hotel-service": ("hotel-service/Dockerfile", "hotel-service"),
            "payment-service": ("payment-service/Dockerfile", "payment-service"),
            "customer-service": ("customer-service/Dockerfile", "customer-service"),
            "notification-service": ("notification-service/Dockerfile", "notification-service"),
            "storefront-bff": ("storefront-bff/Dockerfile", "storefront-bff"),
            "backoffice-bff": ("backoffice-bff/Dockerfile", "backoffice-bff"),
            "media-service": ("media-service/Dockerfile", "media-service"),
            "transport-service": ("transport-service/Dockerfile", "transport-service"),
        }
        
        self.frontend_services = {
            "storefront-fe": "storefront-fe",
            "backoffice-fe": "backoffice-fe",
        }
    
    def print_status(self, message: str):
        """Print info message"""
        print(f"{Colors.BLUE}[INFO]{Colors.NC} {message}")
    
    def print_success(self, message: str):
        """Print success message"""
        print(f"{Colors.GREEN}[SUCCESS]{Colors.NC} {message}")
    
    def print_warning(self, message: str):
        """Print warning message"""
        print(f"{Colors.YELLOW}[WARNING]{Colors.NC} {message}")
    
    def print_error(self, message: str):
        """Print error message"""
        print(f"{Colors.RED}[ERROR]{Colors.NC} {message}")
    
    def run_command(self, command: List[str], cwd: Optional[str] = None, capture_output: bool = False) -> Tuple[bool, str]:
        """Run a shell command and return success status and output"""
        try:
            if capture_output:
                result = subprocess.run(command, cwd=cwd, capture_output=True, text=True, check=True)
                return True, result.stdout.strip()
            else:
                result = subprocess.run(command, cwd=cwd, check=True)
                return True, ""
        except subprocess.CalledProcessError as e:
            if capture_output:
                return False, e.stderr.strip() if e.stderr else str(e)
            else:
                return False, str(e)
        except FileNotFoundError:
            return False, f"Command not found: {command[0]}"
    
    def check_docker(self) -> bool:
        """Check if Docker is running"""
        self.print_status("Checking Docker...")
        success, output = self.run_command(["docker", "info"], capture_output=True)
        if success:
            self.print_success("Docker is running")
            return True
        else:
            self.print_error("Docker is not running. Please start Docker and try again.")
            return False
    
    def docker_login(self) -> bool:
        """Login to Docker Hub"""
        self.print_status("Logging into Docker Hub...")
        
        # Check if already logged in
        success, output = self.run_command(["docker", "system", "info"], capture_output=True)
        if success and self.username in output:
            self.print_success("Already logged into Docker Hub")
            return True
        
        # Try to login with token if available
        token = os.getenv("DOCKER_HUB_TOKEN")
        if token:
            self.print_status("Using DOCKER_HUB_TOKEN for authentication")
            process = subprocess.Popen(
                ["docker", "login", "--username", self.username, "--password-stdin"],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            stdout, stderr = process.communicate(input=token)
            
            if process.returncode == 0:
                self.print_success("Logged into Docker Hub using token")
                return True
            else:
                self.print_error(f"Failed to login with token: {stderr}")
                return False
        else:
            self.print_warning("DOCKER_HUB_TOKEN not set. Please login manually:")
            success, _ = self.run_command(["docker", "login"])
            if success:
                self.print_success("Logged into Docker Hub")
                return True
            else:
                self.print_error("Failed to login to Docker Hub")
                return False
    
    def build_maven_services(self) -> bool:
        """Build all Maven services"""
        self.print_status("Building Maven services...")
        success, output = self.run_command(["mvn", "clean", "package", "-DskipTests"])
        if success:
            self.print_success("Maven build completed")
            return True
        else:
            self.print_error(f"Maven build failed: {output}")
            return False
    
    def build_single_maven_service(self, service_name: str) -> bool:
        """Build a single Maven service"""
        self.print_status(f"Building Maven project for {service_name}...")
        
        pom_path = Path(service_name) / "pom.xml"
        if not pom_path.exists():
            self.print_error(f"pom.xml not found for {service_name}")
            return False
        
        success, output = self.run_command([
            "mvn", "clean", "package", "-DskipTests", 
            "-pl", service_name, "-am"
        ])
        
        if success:
            self.print_success(f"Maven build completed for {service_name}")
            return True
        else:
            self.print_error(f"Maven build failed for {service_name}: {output}")
            return False
    
    def build_and_push_service(self, service_name: str, dockerfile_path: str, context_path: str) -> bool:
        """Build and push a backend service"""
        image_name = f"{self.registry}/{self.username}/bookingsmart-{service_name}:{self.version}"
        
        self.print_status(f"Building {service_name}...")
        
        # Build the Docker image
        success, output = self.run_command([
            "docker", "build", "-t", image_name, "-f", dockerfile_path, context_path
        ])
        
        if not success:
            self.print_error(f"Failed to build {service_name}: {output}")
            return False
        
        self.print_success(f"Built {service_name} image: {image_name}")
        
        # Push to Docker Hub
        self.print_status(f"Pushing {service_name} to Docker Hub...")
        success, output = self.run_command(["docker", "push", image_name])
        
        if success:
            self.print_success(f"Pushed {service_name}: {image_name}")
            return True
        else:
            self.print_error(f"Failed to push {service_name}: {output}")
            return False
    
    def build_and_push_frontend(self, service_name: str, service_path: str) -> bool:
        """Build and push a frontend service"""
        image_name = f"{self.registry}/{self.username}/bookingsmart-{service_name}:{self.version}"
        
        self.print_status(f"Building {service_name} frontend...")
        
        # Build the Docker image
        success, output = self.run_command(
            ["docker", "build", "-t", image_name, "."],
            cwd=service_path
        )
        
        if not success:
            self.print_error(f"Failed to build {service_name}: {output}")
            return False
        
        self.print_success(f"Built {service_name} image: {image_name}")
        
        # Push to Docker Hub
        self.print_status(f"Pushing {service_name} to Docker Hub...")
        success, output = self.run_command(["docker", "push", image_name])
        
        if success:
            self.print_success(f"Pushed {service_name}: {image_name}")
            return True
        else:
            self.print_error(f"Failed to push {service_name}: {output}")
            return False
    
    def deploy_all_services(self) -> bool:
        """Deploy all services to Docker Hub"""
        self.print_status("Starting Docker Hub deployment for BookingSmart Platform")
        self.print_status(f"Docker Hub Username: {self.username}")
        self.print_status(f"Version: {self.version}")
        self.print_status(f"Registry: {self.registry}")
        
        # Check prerequisites
        if not self.check_docker():
            return False
        
        if not self.docker_login():
            return False
        
        # Build Maven services first
        if not self.build_maven_services():
            return False
        
        # Build and push backend services
        self.print_status("Building and pushing backend services...")
        for service_name, (dockerfile, context) in self.backend_services.items():
            if self.build_and_push_service(service_name, dockerfile, context):
                self.successful_services.append(service_name)
            else:
                self.failed_services.append(service_name)
        
        # Build and push frontend services
        self.print_status("Building and pushing frontend services...")
        for service_name, service_path in self.frontend_services.items():
            if self.build_and_push_frontend(service_name, service_path):
                self.successful_services.append(service_name)
            else:
                self.failed_services.append(service_name)
        
        return len(self.failed_services) == 0
    
    def deploy_single_service(self, service_name: str) -> bool:
        """Deploy a single service to Docker Hub"""
        self.print_status(f"Building and pushing {service_name} to Docker Hub")
        self.print_status(f"Docker Hub Username: {self.username}")
        self.print_status(f"Version: {self.version}")
        self.print_status(f"Registry: {self.registry}")
        
        # Check prerequisites
        if not self.check_docker():
            return False
        
        if not self.docker_login():
            return False
        
        # Check if service exists and build accordingly
        if service_name in self.backend_services:
            # Build Maven project first
            if not self.build_single_maven_service(service_name):
                return False
            
            dockerfile, context = self.backend_services[service_name]
            success = self.build_and_push_service(service_name, dockerfile, context)
        elif service_name in self.frontend_services:
            service_path = self.frontend_services[service_name]
            success = self.build_and_push_frontend(service_name, service_path)
        else:
            self.print_error(f"Unknown service: {service_name}")
            self.print_available_services()
            return False
        
        if success:
            self.print_success(f"Successfully built and pushed {service_name}!")
            self.print_status(f"Image: {self.registry}/{self.username}/bookingsmart-{service_name}:{self.version}")
            return True
        else:
            return False
    
    def print_available_services(self):
        """Print list of available services"""
        print("\nAvailable services:")
        print("  Backend Services:")
        for service in self.backend_services.keys():
            print(f"    - {service}")
        print("  Frontend Services:")
        for service in self.frontend_services.keys():
            print(f"    - {service}")
    
    def print_summary(self):
        """Print deployment summary"""
        if self.failed_services:
            self.print_error("The following services failed to build/push:")
            for service in self.failed_services:
                print(f"  - {service}")
        
        if self.successful_services:
            self.print_success("Successfully deployed services:")
            for service in self.successful_services:
                image_name = f"{self.registry}/{self.username}/bookingsmart-{service}:{self.version}"
                print(f"  - {image_name}")

def main():
    """Main function"""
    parser = argparse.ArgumentParser(
        description="Docker Hub Deployment Script for BookingSmart Platform",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python docker_deploy.py --username phamduyhuyuit                    # Deploy all services
  python docker_deploy.py --username phamduyhuyuit --version v1.0.0   # Deploy with specific version
  python docker_deploy.py --username phamduyhuyuit --service booking-service  # Deploy single service
  python docker_deploy.py --list-services                        # List available services
        """
    )
    
    parser.add_argument("--username", "-u",
                       default=os.getenv("DOCKER_HUB_USERNAME", "phamduyhuyuit"),
                       help="Docker Hub username (default: phamduyhuyuit)")
    
    parser.add_argument("--version", "-v", 
                       default="latest",
                       help="Image version tag (default: latest)")
    
    parser.add_argument("--registry", "-r", 
                       default="docker.io",
                       help="Docker registry (default: docker.io)")
    
    parser.add_argument("--service", "-s",
                       help="Deploy single service instead of all services")
    
    parser.add_argument("--list-services", "-l",
                       action="store_true",
                       help="List available services and exit")
    
    args = parser.parse_args()
    
    deployer = DockerDeployer(args.username, args.version, args.registry)
    
    if args.list_services:
        deployer.print_available_services()
        return
    
    try:
        if args.service:
            success = deployer.deploy_single_service(args.service)
        else:
            success = deployer.deploy_all_services()
        
        deployer.print_summary()
        
        if not success:
            sys.exit(1)
            
    except KeyboardInterrupt:
        deployer.print_warning("\nDeployment interrupted by user")
        sys.exit(1)
    except Exception as e:
        deployer.print_error(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
