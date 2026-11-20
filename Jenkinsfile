pipeline {
    agent any

    environment {
        // Backend configuration
        BACKEND_DIR = 'SmartCampus-backend'
        FRONTEND_DIR = 'SmartCampus-frontend'
        MAVEN_OPTS = '-DskipTests -Dmaven.test.skip=true'
        
        // Node.js version
        NODE_VERSION = '18'
        
        // Docker registry (optional - configure for deployment)
        DOCKER_REGISTRY = ''
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        // Stage 1: Checkout source code from Git
        stage('Checkout') {
            steps {
                echo 'Cloning source code from Git repository...'
                checkout scm
                echo 'Source code downloaded successfully.'
            }
        }

        // Stage 2: Build Backend (Spring Boot)
        stage('Build Backend') {
            steps {
                echo 'Building Spring Boot Backend...'
                dir("${env.BACKEND_DIR}") {
                    sh "mvn clean package ${env.MAVEN_OPTIONS} -DskipTests"
                }
                echo 'Backend build completed successfully.'
            }
            post {
                failure {
                    echo 'Backend build failed! Check logs above.'
                }
            }
        }

        // Stage 3: Build Frontend (Angular)
        stage('Build Frontend') {
            steps {
                echo 'Building Angular Frontend...'
                dir("${env.FRONTEND_DIR}") {
                    sh 'npm install'
                    sh 'npm run build'
                }
                echo 'Frontend build completed successfully.'
            }
            post {
                failure {
                    echo 'Frontend build failed! Check logs above.'
                }
            }
        }

        // Stage 4: Run Tests (Optional - run unit tests)
        stage('Run Tests') {
            steps {
                echo 'Running Backend Tests...'
                dir("${env.BACKEND_DIR}") {
                    sh 'mvn test'
                }
                echo 'Running Frontend Tests...'
                dir("${env.FRONTEND_DIR}") {
                    sh 'npm test -- --watch=false'
                }
                echo 'Tests completed successfully.'
            }
            post {
                failure {
                    echo 'Tests failed! Check logs above.'
                }
            }
        }

        // Stage 5: Package Artifacts
        stage('Package Artifacts') {
            steps {
                echo 'Packaging application artifacts...'
                // Package backend JAR
                sh 'cp SmartCampus-backend/target/*.jar SmartCampus-backend/app.jar'
                // Package frontend build
                sh 'cp -r SmartCampus-frontend/dist/* SmartCampus-backend/target/static/'
                echo 'Artifacts packaged successfully.'
            }
        }

        // Stage 6: Deploy (Optional - configure your deploy target)
        stage('Deploy') {
            steps {
                echo 'Deploying application...'
                // Example Docker build and push:
                // sh 'docker build -t ${DOCKER_REGISTRY}/smartcampus-backend:${IMAGE_TAG} SmartCampus-backend/'
                // sh 'docker push ${DOCKER_REGISTRY}/smartcampus-backend:${IMAGE_TAG}'
                
                echo 'Deployment completed successfully.'
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed.'
            // Archive build artifacts
            archiveArtifacts artifacts: 'SmartCampus-backend/target/*.jar', fingerprint: true
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check error logs above.'
        }
        unstable {
            echo 'Pipeline unstable. Some tests may have failed.'
        }
        changed {
            echo 'Pipeline status changed.'
        }
        aborted {
            echo 'Pipeline was aborted.'
        }
    }
}