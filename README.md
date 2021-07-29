## Criar apk

https://reactnative.dev/docs/signed-apk-android

## Gerar key

```
cmd /c "C:\Program Files\Java\jdk1.8.0_241\bin\keytool" -genkeypair -v -keystore casepics.keystore -alias casepics -keyalg RSA -keysize 2048 -validity 10000
```

## Alterar arquivos

android\gradle.properties

```
MYAPP_UPLOAD_STORE_FILE=casepics.keystore
MYAPP_UPLOAD_KEY_ALIAS=casepics
MYAPP_UPLOAD_STORE_PASSWORD=***
MYAPP_UPLOAD_KEY_PASSWORD=***
```

## Gerar apk

```
./gradlew app:assembleRelease
```