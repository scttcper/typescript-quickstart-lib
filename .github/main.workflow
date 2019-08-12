workflow "CI" {
  on = "push"
  resolves = [
    "Lint",
    "Publish semantic-release",
    "Codecov",
  ]
}

action "Install" {
  uses = "actions/npm@master"
  args = "install"
}

action "Test" {
  uses = "actions/npm@master"
  args = "run test:ci"
  needs = ["Install"]
}

action "Codecov" {
  uses = "Atrox/codecov-action@master"
  needs = ["Test"]
  secrets = ["CODECOV_TOKEN"]
}

action "Lint" {
  uses = "actions/npm@master"
  args = "run lint"
  needs = ["Install"]
}

action "Build" {
  uses = "actions/npm@master"
  needs = ["Test", "Lint"]
  args = "build"
}

action "Master" {
  uses = "actions/bin/filter@master"
  needs = ["Build"]
  args = "branch master"
}

action "Release" {
  uses = "actions/npm@master"
  needs = ["Master"]
  args = "run semantic-release"
  secrets = ["GITHUB_TOKEN", "NPM_TOKEN"]
}
