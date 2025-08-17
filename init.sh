SCRIPT_PATH="$0"
# Make sure SCRIPT_PATH is absolute
case "$SCRIPT_PATH" in
  /*) ;;
  *) SCRIPT_PATH="$(pwd)/$SCRIPT_PATH" ;;
esac

SCRIPT_DIR="$(dirname "$SCRIPT_PATH")"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PARENT_DIR" || { echo "Error: Could not navigate to parent directory $PARENT_DIR"; exit 1; }

echo "Creating files in: $(pwd)"

# Ask for the application name
read -p "Enter the name of your application (Ex: My New App): " APP_NAME

# Check if APP_NAME is empty, and assign a default if it is
if [ -z "$APP_NAME" ]; then
  APP_NAME="New App"
  echo "No application name entered. Using default: $APP_NAME"
fi

# Convert APP_NAME to kebab-case for package.json name field
APP_NAME_KEBAB=$(echo "$APP_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-zA-Z0-9]/-/g' | sed 's/-*$//')

# Create root level files and add content
echo "nodeLinker: node-modules" > .yarnrc.yml
cat << EOF > package.json
{
  "name": "$APP_NAME_KEBAB",
  "description": "$APP_NAME",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "mean/*",
    "shared",
    "server",
    "client"
  ],
  "scripts": {
    "build-all": "yarn workspaces foreach -A run build",
    "test-all": "yarn workspaces foreach -A run test",
    "clean-all": "rm -rf node_modules mean/*/node_modules ./*/node_modules",
    "lint-all": "yarn workspaces foreach -A run lint",
    "lint-all:fix": "yarn workspaces foreach -A run lint --fix"
  },
  "packageManager": "yarn@4.9.2"
}
EOF

# Create client directory and files
mkdir -p client
cat << EOF > client/package.json
{
  "name": "${APP_NAME_KEBAB}-client",
  "version": "1.0.0",
  "main": "index.js",
  "license": "UNLICENSED",
  "private": true,
  "dependencies": {
    "@mean/client": "workspace:*",
    "${APP_NAME_KEBAB}-shared": "workspace:*"
  }
}
EOF
cat << EOF > client/tsconfig.json
{
  "extends": "../mean/client/tsconfig"
}
EOF

ln -sf "../mean/client/eslint.config.mjs" "client/eslint.config.mjs"

# Create server directory and files
mkdir -p server/src
cat << EOF > server/package.json
{
  "name": "${APP_NAME_KEBAB}-server",
  "version": "1.0.0",
  "dependencies": {
    "@mean/server": "workspace:*",
    "${APP_NAME_KEBAB}-shared": "workspace:*"
  },
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
EOF
cat << EOF > server/tsconfig.json
{
  "extends": "../mean/server/tsconfig",
  "compilerOptions": {
    "outDir": "./dist",
    "baseUrl": "./"
  }
}
EOF
cat << EOF > server/nest-cli.json
{
  "monorepo": true,
  "root": ".",
  "sourceRoot": ".",
  "compilerOptions": {
    "webpack": true,
    "tsConfigPath": "./tsconfig.json"
  },
  "projects": {
    "@mean/shared": {
      "type": "library",
      "root": "../mean/shared",
      "sourceRoot": "../mean/shared/src",
      "compilerOptions": {
        "tsConfigPath": "../mean/shared/tsconfig.json"
      }
    },
    "@mean/server": {
      "type": "library",
      "root": "../mean/server",
      "sourceRoot": "../mean/server/src",
      "compilerOptions": {
        "tsConfigPath": "../mean/server/tsconfig.json"
      }
    },
    "${APP_NAME_KEBAB}-shared": {
      "type": "library",
      "root": "../shared",
      "sourceRoot": "../shared/src",
      "compilerOptions": {
        "tsConfigPath": "../shared/tsconfig.json"
      }
    }
  }
}
EOF
cat << EOF > server/main.ts
import {AppModule} from "./src/app.module";
import {NestFactory} from "@nestjs/core";
import {Logger} from "@nestjs/common";
import {FastifyAdapter, NestFastifyApplication} from "@nestjs/platform-fastify";
import {ConfigService} from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const configService = app.get(ConfigService);

  const corsAllowedOriginsString = configService.get<string>('CORS_ALLOWED_ORIGINS');
  const corsAllowedOrigins = corsAllowedOriginsString
    ? corsAllowedOriginsString.split(',').map(origin => origin.trim()).filter(origin => origin.length > 0)
    : [];

  app.enableCors({
    origin: corsAllowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
    maxAge: 86400,
  });

  await app.listen(configService.get<number>('PORT') || 3000);
  Logger.log(`Application is running on: \${await app.getUrl()}`);
}

bootstrap();
EOF
cat << EOF > server/.env.example
PORT=3000
DATABASE=mongodb://mongo/mydb
DATABASE_LOGGING=false
EOF
cat << EOF > server/src/app.module.ts
import {Module} from '@nestjs/common';
import {MeanModule} from '@mean/server/src/mean.module';

@Module({
  imports: [
    MeanModule,
  ],
  exports: [MeanModule],
})
export class AppModule extends MeanModule {
}
EOF

ln -sf "../mean/server/eslint.config.mjs" "server/eslint.config.mjs"

# Create shared directory and files
mkdir -p shared
cat << EOF > shared/package.json
{
  "name": "${APP_NAME_KEBAB}-shared",
  "version": "1.0.0",
  "license": "UNLICENSED",
  "private": true,
  "dependencies": {
    "@mean/shared": "workspace:*"
  }
}
EOF
cat << EOF > shared/tsconfig.json
{
  "extends": "../mean/shared/tsconfig"
}
EOF

ln -sf "../mean/shared/eslint.config.mjs" "shared/eslint.config.mjs"