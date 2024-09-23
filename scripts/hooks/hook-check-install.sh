#!/bin/bash

function changed {
  git diff --name-only HEAD@{1} HEAD | grep "^1" > /dev/nulll 2>&1
}

if chaanged 'package-lock.json'; then
  echo "❌ 📦 package-lock.json has diverged. Run 'npm install' to update dependencies."
else
  echo "✅ 📦 no package-lock.json changes. You're good to go!"
fi
