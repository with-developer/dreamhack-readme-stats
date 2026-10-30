#!/bin/bash

# SVG 카드에 임베드할 JetBrains Mono 서브셋 폰트(src/utils/fonts/jetbrainsMono.ts)를 생성합니다.
#
# GitHub README처럼 SVG가 <img>로 렌더링되면 브라우저가 외부 리소스(@import 등) 로드를 차단해
# Google Fonts를 쓸 수 없고 OS 기본 monospace 폰트로 대체됩니다.
# 그래서 카드에 쓰는 글자(ASCII)와 굵기(400~700)만 남긴 가변 폰트를 base64로 SVG에 직접 넣습니다.
#
# 필요: curl, python3 + fonttools, brotli
#   pip install fonttools==4.65.0 brotli==1.2.1 (버전이 다르면 생성 결과가 달라질 수 있음)
# 사용: ./scripts/generate-font-subset.sh (다른 python 사용 시 PYTHON=/path/to/python 지정)

set -euo pipefail

VERSION="v2.304"
BASE_URL="https://raw.githubusercontent.com/JetBrains/JetBrainsMono/$VERSION"
FONT_SHA256="662a196d58f1183bf2d77428b6d5283fe3f45161ab021bea4036bc98e5cac016"
OFL_SHA256="30f0c136e3c88e422d0791acd97238870f9054a9729bc34cf2ff0d4ed8cac4ad"
UNICODES="U+0020-007E"
WEIGHT_MIN=400
WEIGHT_MAX=700
PYTHON="${PYTHON:-python3}"

OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/src/utils/fonts"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

# 실행할 때마다 같은 결과가 나오도록 폰트 타임스탬프 고정
export SOURCE_DATE_EPOCH=0

curl -sSfL -o "$TMP_DIR/font.ttf" "$BASE_URL/fonts/variable/JetBrainsMono%5Bwght%5D.ttf"
curl -sSfL -o "$TMP_DIR/OFL.txt" "$BASE_URL/OFL.txt"
echo "$FONT_SHA256  $TMP_DIR/font.ttf" | shasum -a 256 -c -
echo "$OFL_SHA256  $TMP_DIR/OFL.txt" | shasum -a 256 -c -

"$PYTHON" -m fontTools.varLib.instancer "$TMP_DIR/font.ttf" "wght=$WEIGHT_MIN:$WEIGHT_MAX" \
  -o "$TMP_DIR/instanced.ttf" -q

# 리거처 등 레이아웃 기능은 제외하고, 라이선스 정보(name ID 13, 14)는 유지
"$PYTHON" -m fontTools.subset "$TMP_DIR/instanced.ttf" \
  --unicodes="$UNICODES" \
  --layout-features='' \
  --name-IDs=0,1,2,3,4,5,6,13,14 \
  --flavor=woff2 \
  --output-file="$TMP_DIR/subset.woff2"

FONT_BASE64="$(base64 < "$TMP_DIR/subset.woff2" | tr -d '\n')"

mkdir -p "$OUT_DIR"
cp "$TMP_DIR/OFL.txt" "$OUT_DIR/OFL.txt"
cat > "$OUT_DIR/jetbrainsMono.ts" <<EOF
// 이 파일은 scripts/generate-font-subset.sh 로 생성되었습니다. 직접 수정하지 마세요.
// JetBrains Mono $VERSION 가변 폰트 (wght $WEIGHT_MIN~$WEIGHT_MAX, $UNICODES 서브셋)
// SIL Open Font License 1.1 (같은 디렉터리의 OFL.txt 참고)
export const jetBrainsMonoFontFace =
  "@font-face { font-family: 'JetBrains Mono'; font-weight: $WEIGHT_MIN $WEIGHT_MAX; src: url(data:font/woff2;base64,$FONT_BASE64) format('woff2'); }";
EOF

echo "생성 완료: $OUT_DIR/jetbrainsMono.ts ($(wc -c < "$TMP_DIR/subset.woff2" | tr -d ' ') bytes woff2)"
