pipeline {
   agent {
      node {
         label "apps"
         customWorkspace "/home/apps/mintbubblex"
      }
   }

   stages {
      stage("build") {
         steps {
            echo "✨ building.."
            sh "npm install --omit=dev"
         }
      }
      stage("start") {
         steps {
            echo "✨ starting.."
            withCredentials([ string(credentialsId: "DOTENV_KEY_MINTBUBBLEX", variable: "DOTENV_KEY") ]) {
               sh 'echo $DOTENV_KEY > DOTENV_KEY'
            }
            sh "npm start"
         }
      }
   }

   post {
      cleanup {
         echo "✨ cleaning up.."
         dir("${workspace}@tmp") {
            deleteDir()
         }
      }
   }
}