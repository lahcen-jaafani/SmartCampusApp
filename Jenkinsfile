
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

                    // Stop previous applications
                    sh '''
                        if [ -f SmartCampus-backend/backend.pid ]; then
                            kill "$(cat SmartCampus-backend/backend.pid)" 2>/dev/null || true
                            rm -f SmartCampus-backend/backend.pid
                        fi

                        if [ -f SmartCampus-frontend/frontend.pid ]; then
                            kill "$(cat SmartCampus-frontend/frontend.pid)" 2>/dev/null || true
                            rm -f SmartCampus-frontend/frontend.pid
                        fi
                    '''

                    // Start Backend
                    dir("${BACKEND_DIR}") {
                        sh '''
                            JENKINS_NODE_COOKIE=dontKillMe \
                            nohup java -jar app.jar \
                                --server.port=${BACKEND_PORT} \
                                > backend.log 2>&1 < /dev/null &

                            echo $! > backend.pid
                        '''
                    }

                    // Start Frontend
                    dir("${FRONTEND_DIR}") {
                        sh '''
                            JENKINS_NODE_COOKIE=dontKillMe \
                            nohup npm start -- \
                                --host 0.0.0.0 \
                                --port ${FRONTEND_PORT} \
                                > frontend.log 2>&1 < /dev/null &

                            echo $! > frontend.pid
                        '''
                    }

                    echo 'Applications started.'
                }
            }
        }

        // 6. Verify Deployment
        stage('Verify Deployment') {
            steps {
                sh '''
                    echo "Checking Backend..."

                    for i in $(seq 1 30); do
                        if curl -fsS http://localhost:${BACKEND_PORT}/actuator/health >/dev/null; then
                            echo "Backend is running!"
                            break
                        fi
                        sleep 2
                    done

                    echo "Checking Frontend..."

                    for i in $(seq 1 30); do
                        if curl -fsS http://localhost:${FRONTEND_PORT} >/dev/null; then
                            echo "Frontend is running!"
                            exit 0
                        fi
                        sleep 2
                    done

                    echo "Frontend failed to start!"
                    cat SmartCampus-frontend/frontend.log
                    exit 1
                '''
            }
        }
    }

    post {
        always {
            archiveArtifacts(
                artifacts: 'SmartCampus-backend/target/*.jar,SmartCampus-backend/*.log,SmartCampus-frontend/frontend.log',
                fingerprint: true,
                allowEmptyArchive: true
            )
        }

        success {
            echo 'SmartCampus CI/CD pipeline completed successfully!'
            echo 'Backend: http://localhost:8090'
            echo 'Frontend: http://localhost:4200'
        }

        failure {
            echo 'Deployment failed. Check application logs.'
        }
    }
}
