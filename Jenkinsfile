```groovy
pipeline {
    agent any

    environment {
        BACKEND_DIR = 'SmartCampus-backend'
        FRONTEND_DIR = 'SmartCampus-frontend'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir("${BACKEND_DIR}") {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir("${FRONTEND_DIR}") {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Run Backend Tests') {
            steps {
                dir("${BACKEND_DIR}") {
                    sh 'mvn test'
                }
            }
        }

        stage('Run Frontend Tests') {
            steps {
                dir("${FRONTEND_DIR}") {
                    sh 'npm test -- --watch=false'
                }
            }
        }

        stage('Package Artifacts') {
            steps {
                sh '''
                    mkdir -p SmartCampus-backend/target/static
                    cp SmartCampus-backend/target/*.jar SmartCampus-backend/app.jar
                    cp -r SmartCampus-frontend/dist/* SmartCampus-backend/target/static/
                '''
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo 'Deployment stage ready.'
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'SmartCampus-backend/target/*.jar',
                             fingerprint: true,
                             allowEmptyArchive: true
        }

        success {
            echo 'Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check the logs.'
        }
    }
}
```
