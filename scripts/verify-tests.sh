#!/bin/bash

# 메인 브랜치에서만 실행
if [ "$VERCEL_GIT_COMMIT_REF" != "main" ]; then
  echo "메인 브랜치가 아닙니다. 배포 계속 진행합니다."
  exit 0
fi

# GitHub API 호출을 위한 준비
AUTH_HEADER="Authorization: token $GITHUB_TOKEN"
GITHUB_USER="with-developer"
GITHUB_REPO="dreamhack-readme-stats"
API_URL="https://api.github.com/repos/$GITHUB_USER/$GITHUB_REPO/commits/$VERCEL_GIT_COMMIT_SHA/check-runs"

echo "GitHub API 호출: $API_URL"

# jq 설치
apt-get update && apt-get install -y jq

# API 호출 및 테스트 상태 확인
RESPONSE=$(curl -s -H "$AUTH_HEADER" "$API_URL")
TEST_STATUS=$(echo "$RESPONSE" | jq -r '.check_runs[] | select(.name | contains("test")) | .conclusion')

echo "테스트 상태: $TEST_STATUS"

# 테스트 성공 확인
if [[ "$TEST_STATUS" == "success" ]]; then
  echo "테스트 성공. 배포 진행합니다."
  exit 0
else
  echo "테스트 실패 또는 미완료. 배포 중단합니다."
  exit 1
fi 