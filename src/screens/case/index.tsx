import { View, StyleSheet, Text, SafeAreaView, FlatList, TouchableOpacity, Modal, Alert, PermissionsAndroid, Image, useWindowDimensions, RefreshControl } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import RBSheet from "react-native-raw-bottom-sheet";
import Header from './header';
import BottomSheet from "./bottom_sheet"
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ImageViewer from 'react-native-image-zoom-viewer';
import prompt from 'react-native-prompt-android';
import { savePicture, getPics, clearFolder, deletePicture, renamePicture, saveLastObjectName, getLastObjectName, getCTime, genUrlFile } from "../../services/storage_manager";
import values from '../../values';
import { RouteProp } from '@react-navigation/native';
import { RootNavigationParamsList } from '../../navigation/root_navigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { Pic, PicFilterResult } from '../../types/interfaces';
import { useMemo } from 'react';
import InputWidget from '../../components/input_widget';
import Menu from './menu';


type CaseScreenNavigationProp = StackNavigationProp<RootNavigationParamsList, 'Case'>;
type CaseScreenRouteProp = RouteProp<RootNavigationParamsList, 'Case'>;

type Props = {

  navigation: CaseScreenNavigationProp,
  route: CaseScreenRouteProp
};


const CaseScreen = ({ route, navigation }: Props) => {


  const [objName, setObjName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pics, setPics] = useState<Pic[]>([]);
  const [selectedPicIndex, setSelectedPicIndex] = useState<number>(-1);
  const [selectedPicIndexFiltered, setSelectedPicIndexFiltered] = useState<number>(-1);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const refRBSheet = useRef<RBSheet>(null);
  const caseName = route.params.caseName;
  const window = useWindowDimensions();
  const [refreshing, setRefreshing] = React.useState<boolean>(true);
  const [sortBy, setSortBy] = useState<"timestamp" | "alpha">("timestamp");
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const orderedPics = useMemo<PicFilterResult[]>(() => {
    const mapedPics: PicFilterResult[] = pics.map((pic, index) => {
      return {
        pic,
        index
      }
    })
    const filtered = mapedPics.filter((item, index) => {
      return item.pic.name.toLowerCase().includes(searchTerm.toLowerCase());
    })
    if (sortBy == 'timestamp') {
      return filtered.sort((a, b) => {
        if (a.pic.timestamp === undefined) {
          return -1;
        }
        if (b.pic.timestamp === undefined) {
          return 1;
        }
        if (a.pic.timestamp < b.pic.timestamp) {
          return -1
        }
        return 1;
      });
    } else {
      return filtered.sort((a, b) => a.pic.name.toLowerCase().localeCompare(b.pic.name.toLowerCase()));
    }

  }, [pics, searchTerm, sortBy]);

  const reloadPics = async () => {
    setRefreshing(true);
    try {
      const pics = await getPics(caseName);
      setPics(pics)
    } catch (error) {
      console.log(error)
    } finally {
      setRefreshing(false);
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
        }, async (response) => {
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.errorMessage) {
            console.log('ImagePicker Error: ', response.errorMessage);
          } else {
            const uri = response.assets?.[0].uri;
            if (uri != undefined) {
              try {
                const newPic = await savePicture(uri, objName, caseName);
                setPics([...pics, newPic]);
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
      }, async (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorMessage) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else {
          let assets = response.assets;
          if (assets != undefined) {
            let newPics: Pic[] = [];
            for (let index = 0; index < assets.length; index++) {
              const uri = assets[index].uri;
              try {
                const info = await savePicture(uri!, objName, caseName);
                newPics.push({
                  name: info.name,
                  path: info.path,
                  caseName: caseName,
                  timestamp: await getCTime(info.path),
                  url: genUrlFile(info.path)
                });

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
      await deletePicture(pics[selectedPicIndex])
      let newPics = [...pics];
      newPics.splice(selectedPicIndex, 1)
      setPics(newPics);
      setSelectedPicIndex(-1);
      setSelectedPicIndexFiltered(-1);
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
              const newPic = await renamePicture(pic, name)
              let copyPics = [...pics];
              copyPics[selectedPicIndex] = newPic;
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
      pic: pics[selectedPicIndex]
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
    <SafeAreaView style={styles.safeAreaView}>
    <View style={styles.container}>
      <Header
        title={`${caseName} (${orderedPics.length})`}
        onClear={clearFolderWrap}
        onTakePicture={takePicture}
        refreshing={refreshing}
        onChoosePhoto={pickPictures}
        onBack={goToCases}
        onShowMenu={() => { setShowMenu(true) }}
      />
      <InputWidget
        style={styles.input}
        onChangeText={setObjName}
        value={objName}
        placeholder="Nome do objeto"
        icon="edit"
      />
      <InputWidget
        style={styles.input}
        onChangeText={setSearchTerm}
        value={searchTerm}
        placeholder="Digite algo para pesquisar..."
        icon="search"
      />

      
        <FlatList<PicFilterResult>
          horizontal={false}
          data={orderedPics}
          numColumns={3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={reloadPics}
            />
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.listItemContainer}
              delayLongPress={200}
              onPress={() => {
                setSelectedPicIndex(item.index)
                setSelectedPicIndexFiltered(index)
                vizualizePic(item.pic)
              }}
              onLongPress={() => {
                setSelectedPicIndex(item.index);
                setSelectedPicIndexFiltered(index)
                refRBSheet.current?.open();
              }}
            >
              <View style={styles.listItemInnerContainer}>
                <Image
                  style={styles.listPicture}
                  width={window.width * 0.3}
                  source={{ uri: item.pic.url }} />
                <Text style={styles.listImageText}>{item.pic.name}</Text>
              </View>

            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
        />

     

      <Modal
        visible={modalVisible}
        transparent={false}
        onRequestClose={() => {
          setModalVisible(false)
        }}>
        <ImageViewer imageUrls={orderedPics.map(item => {
          return { url: item.pic.url }
        })}
          index={selectedPicIndexFiltered}
        />
      </Modal>
      <Modal
        style={styles.menuModal}
        animationType="fade"
        visible={showMenu}
        transparent={true}
        onRequestClose={() => {
          setShowMenu(false);
        }}
      >
        <Menu sortBy={sortBy} setSortBy={setSortBy} onClose={() => { setShowMenu(false) }} />
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
    </SafeAreaView>
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
    marginBottom: 5
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
  },
  picker: {
    width: "100%",
    fontSize: 8,
    position: "absolute",
    bottom: 0,
    backgroundColor: "#F0F0F0",
    height: 8,
    borderRadius: 15,
    padding: 10,
  },
  menuModal: {

    backgroundColor: "green"
  },
  safeAreaView:{
    // height: 500
  }

})

export default CaseScreen;