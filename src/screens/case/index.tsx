import { TextInput, View, StyleSheet, Text, SafeAreaView, FlatList, TouchableOpacity, Modal, Alert, PermissionsAndroid, Image, useWindowDimensions } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import RBSheet from "react-native-raw-bottom-sheet";
import Header from './header';
import BottomSheet from "./bottom_sheet"
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ImageViewer from 'react-native-image-zoom-viewer';
import prompt from 'react-native-prompt-android';
import { savePicture, getPics, clearFolder, deletePicture, renamePicture, saveLastObjectName, getLastObjectName } from "../../services/storage_manager";
import values from '../../values';
import { RouteProp } from '@react-navigation/native';
import { RootNavigationParamsList } from '../../navigation/root_navigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { Pic } from '../../types/interfaces';
import { useMemo } from 'react';


type CaseScreenNavigationProp = StackNavigationProp<RootNavigationParamsList, 'Note'>;
type CaseScreenRouteProp = RouteProp<RootNavigationParamsList, 'Note'>;

type Props = {

  navigation: CaseScreenNavigationProp,
  route: CaseScreenRouteProp
};


const CaseScreen = ({ route, navigation }: Props) => {

 
  const [objName, setObjName] = useState<string>("");
  const [pics, setPics] = useState<Pic[]>([]);
  const [selectedPicIndex, setSelectedPicIndex] = useState<number>(-1);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [imageModalUrl, setImageModalUrl] = useState<string>("");
  const refRBSheet = useRef<RBSheet>(null);
  const caseName = route.params.caseName;
  const window = useWindowDimensions();

  // const orderedPics = useMemo<Pic[]>(()=>{
  //   return pics;
  // }, [pics]);

  const reloadPics = async () => {
    try {
      const pics = await getPics(caseName);
      setPics(pics)
    } catch (error) {
      console.log(error)
    }
  }

  const clearFolderWrap = async () => {
    Alert.alert(
      'Deletar todas',
      'Tem certeza de que deseja deletar todas as fotos?',
      [

        {
          text: 'Não',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        {
          text: 'SIM', onPress: async () => {
            await clearFolder(caseName);
            reloadPics();
          }
        }
      ],
      { cancelable: false }
    );
  }

  const takePicture = async () => {
    console.log("Tirar foto")
    if (objName == "") {
      Alert.alert(
        'Nome vazio',
        'É necessário definir o nome do objeto.',
        [
          {
            text: 'OK',
            onPress: () => { }
          }
        ],
        { cancelable: false }
      );
      return
    }
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "App Camera Permission",
          message: "App needs access to your camera ",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        launchCamera({
          quality: 1,
          mediaType: 'photo'
          // storageOptions: {
          //   skipBackup: true,
          //   privateDirectory: true
          // },
        }, async (response) => {
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.errorMessage) {
            console.log('ImagePicker Error: ', response.errorMessage);
          } else {
            const uri = response.assets?.[0].uri;
            if (uri != undefined) {
              try {
                const info = await savePicture(uri, objName, caseName);
                let number = Math.random();
                setPics([...pics, { source: "file://" + info.path + "#" + number, name: info.name }]);
              } catch (error) {
                console.log(error)
              }
            }

          }
        });
      } else {
        console.log("Camera permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  }

  const pickPictures = async () => {
    if (objName == "") {
      Alert.alert(
        'Nome vazio',
        'É necessário definir o nome do objeto.',
        [
          {
            text: 'OK',
            onPress: () => { }
          }
        ],
        { cancelable: false }
      );
      return
    }
    try {
      launchImageLibrary({
        selectionLimit: 0,
        mediaType: 'photo'
        // storageOptions: {
        //   skipBackup: true,
        //   path: '/storage/emulated/0/DCIM'
        // },
      }, async (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorMessage) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else {
          let assets = response.assets;
          if (assets != undefined) {
            let newPics = [];
            for (let index = 0; index < assets.length; index++) {
              const uri = assets[index].uri;
              try {
                const info = await savePicture(uri!, objName, caseName);
                let number = Math.random();
                newPics.push({ source: "file://" + info.path + "#" + number, name: info.name });

              } catch (error) {
                console.log(error)
              }
            }
            setPics([...pics, ...newPics]);
          }

        }
      });
    } catch (err) {
      console.warn(err);
    }
  }

  const deletePic = async () => {
    refRBSheet.current?.close();
    try {
      await deletePicture(pics[selectedPicIndex].name, caseName)
      pics.splice(selectedPicIndex, 1)
      setPics(pics);
      setSelectedPicIndex(-1);
    } catch (error) {
      console.log(error)
    }
  }

  const renamePic = async () => {
    refRBSheet.current?.close();
    const pic = pics[selectedPicIndex]
    prompt(
      'Novo nome',
      '',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'OK',
          onPress: async name => {
            if (name == pic.name) {
              return
            }
            try {
              const { newName, newPicPath } = await renamePicture(pic.name, name, caseName)
              console.log(newPicPath)
              const source = "file://" + newPicPath + "#" + Math.random();
              let copyPics = [...pics];
              copyPics[selectedPicIndex] = {
                source: source,
                name: name
              }
              setPics(copyPics);

            } catch (error) {
              console.log(error)
            }
          }
        },
      ],
      {
        cancelable: false,
        defaultValue: pics[selectedPicIndex].name,
        placeholder: 'Novo nome'
      }
    );

  }

  const vizualizePic = async (pic?: Pic) => {
    if (pic == undefined) {
      pic = pics[selectedPicIndex];
    }
    refRBSheet.current?.close();
    // setImageModalUrl(pic.source);
    setModalVisible(true);
  }

  const goToCases = async () => {
    console.log("Ir para casos")
    saveLastObjectName(caseName, objName);
    navigation.navigate('Home');
  }

  const editNote = async () => {
    navigation.navigate('Note', {
      caseName: caseName,
      picName: pics[selectedPicIndex].name
    });
  }

  const loadLastObjeName = async () => {
    const name = await getLastObjectName(caseName);
    setObjName(name);
  }

  useEffect(() => {
    reloadPics();
    loadLastObjeName();
  }, []);


  return (
    <View style={styles.container}>
      <Header title={caseName} onClear={clearFolderWrap} onTakePicture={takePicture} onReload={reloadPics} onChoosePhoto={pickPictures} onBack={goToCases} />
      <TextInput
        style={styles.input}
        onChangeText={setObjName}
        value={objName}
        placeholder="Nome do objeto"
      />
      <SafeAreaView>
        <FlatList<Pic>
          horizontal={false}
          data={pics}
          numColumns={3}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.listItemContainer}
              delayLongPress={200}
              onPress={() => {
                setSelectedPicIndex(index)
                vizualizePic(item)
              }}
              onLongPress={() => {
                setSelectedPicIndex(index);
                refRBSheet.current?.open();
              }}
            >
              <View style={styles.listItemInnerContainer}>
                <Image
                  style={styles.listPicture}
                  width={window.width * 0.3}
                  source={{ uri: item.source }} />
                <Text style={styles.listImageText}>{item.name}</Text>
              </View>

            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </SafeAreaView>
      <Modal
        visible={modalVisible}
        transparent={false}
        onRequestClose={() => {
          setModalVisible(false)
        }}>
        <ImageViewer imageUrls={pics.map(pic => {
          return { url: pic.source }
        })}
          index={selectedPicIndex}
        />
      </Modal>
      <RBSheet
        ref={refRBSheet}
        openDuration={250}
        customStyles={{
          container: {
            justifyContent: "flex-start",
            alignItems: "flex-start",
            height: 230
          }
        }}
      >
        <BottomSheet
          onDeletePress={deletePic}
          onVizualizePress={vizualizePic}
          onRenamePress={renamePic}
          onEditNote={editNote}
        />
      </RBSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    flexDirection: "column",
    backgroundColor: "white"
  },
  input: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: values.green_color,
    paddingLeft: 5,
    paddingRight: 5,
    fontSize: 15,
    fontWeight: "bold",
    color: values.green_color
  },
  listPicture: {
    flex: 1,
    // width: Dimensions.get('window').width * 0.3,
    height: undefined,
    aspectRatio: 1,
  },
  listItemContainer: {
    margin: 5,
    width: "30%"
  },
  listItemInnerContainer: {
    flexDirection: "column",
    alignItems: "center",
    alignContent: "center"
  },
  listImageText: {
    color: values.green_color,
    fontWeight: "bold"
  }

})

export default CaseScreen;