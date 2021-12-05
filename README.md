# Descrição

Aplicativo feito com [react-native](https://reactnative.dev/) para tiragem de fotos nomeadas e organizadas em pastas. As fotos tiradas  ficam armazenadas dentro da pasta Pictures/casepics.


# Criar apk

https://reactnative.dev/docs/signed-apk-android

## Gerar key

```
cmd /c "C:\Program Files\Java\jdk1.8.0_241\bin\keytool" -genkeypair -v -keystore casepics.keystore -alias casepics -keyalg RSA -keysize 2048 -validity 10000
```
mover o arquivo casepics.keystore para dentro de android/app/casepics.keystore

## Alterar arquivos

android\gradle.properties

```
MYAPP_UPLOAD_STORE_FILE=casepics.keystore
MYAPP_UPLOAD_KEY_ALIAS=casepics
MYAPP_UPLOAD_STORE_PASSWORD=***
MYAPP_UPLOAD_KEY_PASSWORD=***
```

android/gradle.properties

```
 defaultConfig {
    ...
    versionCode 6
    versionName "1.3.0"
}
...
```

## Gerar apk

```
cd android
./gradlew app:assembleRelease
```

O apk será gerado dentro de android/app/build/outputs/apk/release
