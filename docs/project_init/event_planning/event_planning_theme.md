# TTRPG Event Planning: Theme

## Create default themes

1. `~/shared/scss/defualt-theme-light.scss`
2. `~/shared/scss/defualt-theme-dark.scss`

## Update app's project.json

```json
{
  "targets": {
    "build": {
      "options": {
        "styles": [
          {
            "input": "shared/scss/defult-theme-light.scss",
            "bundleName": "default-theme-light",
            "inject": false
          },
          {
            "input": "shared/scss/defult-theme-dark.scss",
            "bundleName": "default-theme-dark",
            "inject": false
          }
        ]
      },
      "configurations": {
        "production": {
          "extractCss": true
        }
      }
    }
  }
}
```
