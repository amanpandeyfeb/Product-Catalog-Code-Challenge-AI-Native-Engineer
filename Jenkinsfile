pipeline {
  agent { label 'linux' }

  options {
    disableConcurrentBuilds()
    timestamps()
  }

  parameters {
    booleanParam(name: 'DEPLOY_PRODUCTION', defaultValue: false, description: 'Plan and request approval for production deployment on main')
  }

  stages {
    stage('Install, Test and Build') {
      steps {
        sh '''
          set -eu
          npm ci
          npm test
          unset VITE_API_BASE_URL
          npm run build
        '''
      }
    }

    stage('Package Lambda') {
      steps {
        dir('.deploy') {
          deleteDir()
        }
        sh '''
          set -eu
          npm ci --omit=dev --workspace Backend
          mkdir -p .deploy/lambda/Backend
          cp -R Backend/dist .deploy/lambda/Backend/dist
          cp Backend/package.json .deploy/lambda/Backend/package.json
          if [ -d Backend/node_modules ]; then cp -R Backend/node_modules .deploy/lambda/Backend/node_modules; fi
          cp -R node_modules .deploy/lambda/node_modules
          rm -f .deploy/lambda/node_modules/catalog-backend
          cd .deploy/lambda
          zip -qr ../lambda.zip .
        '''
        sh '''
          set -eu
          check_dir=$(mktemp -d)
          trap 'rm -rf "$check_dir"' EXIT
          unzip -q .deploy/lambda.zip -d "$check_dir"
          cd "$check_dir"
          node --input-type=module -e '
            const { handler } = await import("./Backend/dist/lambda.js");
            const result = await handler({ version: "2.0", routeKey: "GET /api/health", rawPath: "/api/health", rawQueryString: "", headers: { host: "example.test" }, requestContext: { http: { method: "GET", path: "/api/health", sourceIp: "127.0.0.1" } }, isBase64Encoded: false }, {}, () => {});
            if (result.statusCode !== 200 || JSON.parse(result.body).status !== "ok") throw new Error("Lambda package health check failed");
          '
        '''
      }
    }

    stage('Validate Terraform') {
      steps {
        dir('terraform') {
          sh 'terraform init -backend=false -input=false && terraform validate'
        }
        stash name: 'deployment', includes: 'terraform/*.tf,terraform/.terraform.lock.hcl,terraform/spa.js,.deploy/lambda.zip,client/dist/**', useDefaultExcludes: false
      }
    }

    stage('Deploy Production') {
      agent { label 'production-deploy' }
      when {
        beforeAgent true
        allOf {
          expression { params.DEPLOY_PRODUCTION }
          expression { env.BRANCH_NAME == 'main' }
        }
      }
      steps {
        dir('deploy-artifacts') {
          deleteDir()
          unstash 'deployment'
          dir('terraform') {
            sh '''
            set -eu
            : "${TF_STATE_BUCKET:?Configure TF_STATE_BUCKET}"
            : "${TF_STATE_REGION:?Configure TF_STATE_REGION}"
            terraform init -reconfigure -input=false \
              -backend-config="bucket=$TF_STATE_BUCKET" \
              -backend-config="key=product-catalog/production.tfstate" \
              -backend-config="region=$TF_STATE_REGION" \
              -backend-config="use_lockfile=true"
            terraform plan -input=false -out=production.tfplan
          '''
            input message: 'Review the Terraform plan in the console output. Deploy to production?', ok: 'Deploy'
            sh '''
            set -eu
            terraform apply -input=false production.tfplan
            bucket=$(terraform output -raw website_bucket)
            distribution=$(terraform output -raw cloudfront_distribution_id)
            aws s3 sync ../client/dist/ "s3://$bucket/" --exclude index.html --cache-control 'public,max-age=3600'
            aws s3 cp ../client/dist/index.html "s3://$bucket/index.html" --cache-control 'no-cache'
            aws cloudfront create-invalidation --distribution-id "$distribution" --paths '/*'
            terraform output -raw website_url
            '''
          }
        }
      }
    }
  }
}