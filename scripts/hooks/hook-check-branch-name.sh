#!/bin/bash

CURRENT_BRANCH_NAME="$(git rev-parse --abbrev-ref HEAD)"

TICKET="(DND)-[0-9]+"
TYPE="(bugfix|docs|e2e|feature|hotfix|refactor|testing)"
PROJECT="(core|auth|event-planning)"
COMMENT="[a-zAA-Z._-]+"

VALID_BRANCH_REGEX="${TICKET}\/${TYPE}\/${PROJECT}\/${COMMENT}"

VALID_RELEASE_BRANCH_REGEX="release-[a-zAA-Z._-]+"

VALID_BRANCH_NAME_REGEX="^(${VALID_BRANCH_REGEX}|${VALID_RELEASE_BRANCH_REGEX}|main|HEAD.*)$"
VALID_BRANCH_EXAMPLE="DND-1234/feature/auth/addedLoginScreen"

if [[ $CURRENT_BRANCH_NAME =~ $VALID_BRANCH_NAME_REGEX ]]; then
  printf "\n✅Brach name is valid: $CURRENT_BRANCH_NAME\n"
else
  printf "\n❌Brach name is invalid: $CURRENT_BRANCH_NAME"
  printf "\n\tYour branch name must conform with the following format:"
  printf "\n\t\t$VALID_BRANCH_NAME_REGEX"
  printf "\n\tExample: $VALID_BRANCH_EXAMPLE"
  printf "\n\tYour commit will be rejected. Please rename your banch and try again. If you belive your branch is valid then update ~/scripts/hooks/hook-check-branch-name.sh"
  exit 1
fi

exit 0
