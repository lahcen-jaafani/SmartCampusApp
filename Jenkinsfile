pipeline {
    agent any

    environment {
        BACKEND_DIR = 'SmartCampus-backend'
        FRONTEND_DIR = 'SmartCampus-frontend'
        BACKEND_PORT = '8090'
        FRONTEND_PORT = '4200'
    }

    stages {

        // 1. Checkout
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // 2. Build Backend
        stage('Build Backend') {
            steps {
                dir("${BACKEND_DIR}") {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        // 3. Build Frontend
        stage('Build Frontend') {
            steps {
                dir("${FRONTEND_DIR}") {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        // 4. Package Artifacts
        stage('Package Artifacts') {
            steps {
                sh '''
                    mkdir -p SmartCampus-backend/target/static

                    cp SmartCampus-backend/target/*.jar \
                       SmartCampus-backend/app.jar

                    cp -r SmartCampus-frontend/dist/* \
                       SmartCampus-backend/target/static/
                '''
            }
        }

        // 5. Deploy
        stage('Deploy') {
            steps {
                script {
                    echo 'Starting SmartCampus deployment...'

                    // Stop previous Backend process
                    sh '''
                        pkill -f 'school_management-back-0.0.1-SNAPSHOT.jar' || true
                    '''

                    // Start Backend Spring Boot
                    sh '''
                        cd SmartCampus-backend

                        nohup java -jar app.jar \
                            --server.port=8090 \
                            > backend.log 2>&1 < /dev/null &
                    '''

                    // Stop previous Frontend process
                    sh '''
                        pkill -f 'ng serve --host 0.0.0.0' || true
                    '''

                    // Start Frontend Angular
                    dir("${FRONTEND_DIR}") {
                        sh '''
                            nohup npm start -- --host 0.0.0.0 --port 4200 \
                                > frontend.log 2>&1 < /dev/null &
                        '''
                    }

                    echo 'Backend: http://localhost:8090'
                    echo 'Frontend: http://localhost:4200'
                }
            }
        }
    }

    post {

        always {
            archiveArtifacts(
                artifacts: 'SmartCampus-backend/target/*.jar',
                fingerprint: true,
                allowEmptyArchive: true
            )
        }

        success {
            echo 'SmartCampus CI/CD pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check Jenkins console output.'
        }
    }
}
