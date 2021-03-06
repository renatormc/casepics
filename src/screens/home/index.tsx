import React, { useState, useEffect, useRef, useMemo } from 'react';
import Spinner from 'react-native-loading-spinner-overlay';

import {
  StyleSheet,
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import {
  getCases,
  createCase,
  renameCase,
  deleteCase,
  zipCase,
  getCaseFiles,
  moveCaseFolder
} from '../../services/storage_manager';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomSheet from './bottom_sheet';
import RBSheet from 'react-native-raw-bottom-sheet';
import prompt from 'react-native-prompt-android';
import Header from './header';
import values from '../../values';
import Share from 'react-native-share';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootNavigationParamsList } from '../../navigation/root_navigator';
import { CaseExistsError } from '../../types/interfaces';
import Menu from './menu';

type HomeScreenNavigationProp = StackNavigationProp<RootNavigationParamsList, 'Home'>;
type HomeScreenRouteProp = RouteProp<RootNavigationParamsList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp,
  route: HomeScreenRouteProp
};


const HomeScreen = ({ navigation, route }: Props) => {
  const [cases, setCases] = useState<string[]>([]);
  const [selectedCaseIndex, setSelectedCaseIndex] = useState<number>(-1);
  const refRBSheet = useRef<RBSheet>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = React.useState<boolean>(true);
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const reloadCases = async () => {
    setRefreshing(true);
    try {
      let cases_ = await getCases(route.params.folder2);
      setCases(cases_);
    } finally {
      setRefreshing(false);
    }

  };

  const orderedCases = useMemo<string[]>(() => {
    return cases.sort((a, b) => a.localeCompare(b));
  }, [cases]);

  const addNew = async () => {
    prompt(
      'Nome',
      '',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'OK',
          onPress: async name => {
            let newName = name.trim();
            if (newName == '') {
              return;
            }
            try {
              const createdName = await createCase(name, route.params.folder2);
              setCases([...cases, createdName]);
            } catch (error) {
              if (error instanceof CaseExistsError) {
                Alert.alert(
                  'Erro',
                  `J?? existe um caso de nome "${name}".`,
                  [
                    {
                      text: 'OK',
                      onPress: () => { }
                    }
                  ],
                  { cancelable: false }
                );
              } else {
                console.log(error);
              }
            }
          },
        },
      ],
      {
        // type: 'text',
        cancelable: false,
        placeholder: 'Nome do caso',
      },
    );
  };

  const renameCaseWraper = async () => {
    refRBSheet.current?.close();
    prompt(
      'Nome',
      '',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'OK',
          onPress: async name => {
            let oldName = cases[selectedCaseIndex];
            let newName = name.trim();
            if (newName == '' || newName == oldName) {
              return;
            }

            try {
              newName = await renameCase(oldName, newName, route.params.folder2);
              let copyCases = [...cases];
              copyCases[selectedCaseIndex] = newName;
              setCases(copyCases);
            } catch (error) {
              console.log(error);
            }
          },
        },
      ],
      {
        // type: 'text',
        cancelable: false,
        defaultValue: cases[selectedCaseIndex],
        placeholder: 'Nome do caso',
      },
    );
  };

  const openCase = async (caseName: string) => {
    if (caseName == undefined) {
      caseName = cases[selectedCaseIndex];
    }
    caseName = caseName.toString();
    refRBSheet.current?.close();
    navigation.navigate('Case', {
      caseName: caseName.toString(),
      folder2: route.params.folder2
    });
  };

  const deleteCaseWrapper = async () => {
    refRBSheet.current?.close();
    Alert.alert(
      'Deletar foto',
      `Tem certeza de que deseja deletar o caso "${cases[selectedCaseIndex]}"?`,
      [

        {
          text: 'N??o',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        {
          text: 'SIM', onPress: async () => {
            try {
              await deleteCase(cases[selectedCaseIndex], route.params.folder2);
              reloadCases();
            } catch (error) {
              console.log(error)
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  const sharePics = async () => {
    const caseName = cases[selectedCaseIndex];
    const pics = await getCaseFiles(caseName, route.params.folder2);
    const options = {
      title: 'Compartilhar',
      message: caseName,
      urls: pics,
    };
    await Share.open(options);
    refRBSheet.current?.close();
  };

  const zipAndSharePics = async () => {
    const caseName = cases[selectedCaseIndex];
    let path = '';
    try {
      setLoading(true);
      path = await zipCase(caseName, route.params.folder2);
    } catch (error) {
      Alert.alert(
        'Erro',
        'Houve um erro ao tentar comprimir os arquivos!',
        [
          {
            text: 'OK',
            onPress: () => { }
          }
        ],
        { cancelable: false }
      );
      setLoading(false);
      return
    }
    setLoading(false);
    const options = {
      title: 'Compartilhar',
      message: caseName,
      url: `file://${path}`,
    };
    await Share.open(options);

    refRBSheet.current?.close();
  };

  const share = async () => {
    Alert.alert('', 'Escolha uma das op????es:', [
      {
        text: 'Compartilhar',
        onPress: sharePics,
      },
      {
        text: 'Zipar e compartilhar',
        onPress: zipAndSharePics,
      },
      {
        text: 'Cancelar',
        onPress: () => { },
      },
    ], { cancelable: false });
  };

  const moveToOtherFolder = async () => {
    refRBSheet.current?.close();
    try {
      await moveCaseFolder(cases[selectedCaseIndex], route.params.folder2);
      reloadCases();
    } catch (error) {
      if (error instanceof CaseExistsError) {
        Alert.alert(
          'Erro',
          `J?? existe um caso de nome "${cases[selectedCaseIndex]}" na outra pasta.`,
          [
            {
              text: 'OK',
              onPress: () => { }
            }
          ],
          { cancelable: false }
        );
      } else {
        console.log(error);
      }
    }
    // await deleteCase(cases[selectedCaseIndex], route.params.folder2);

  }

  const changeFolder = async (folder: "folder1" | "folder2") => {
    const folder2 = folder === "folder2";
    navigation.navigate('Home', { folder2: folder2 });
  }

  useEffect(() => {
    reloadCases();
  }, [route.params.folder2]);

  let title = useMemo(() => {
    return route.params.folder2 ? "Pasta 2" : "Pasta 1";
  }, [route.params.folder2]);

  return (
    <View style={styles.container}>
      <Header title={title} onShowMenu={() => { setShowMenu(true) }} />
      <SafeAreaView>
        <Spinner
          visible={loading}
          textContent={'Aguarde...'}
          textStyle={styles.spinnerTextStyle}
        />
        <FlatList<string>
          horizontal={false}
          data={orderedCases}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={reloadCases}
            />
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.listItemContainer}
              delayLongPress={200}
              onPress={() => {
                setSelectedCaseIndex(index);
                openCase(item);
              }}
              onLongPress={() => {
                setSelectedCaseIndex(index);
                refRBSheet.current?.open();
              }}>
              <View style={styles.listItemInnerContainer}>
                <Text style={styles.listText}>{item}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        <Modal
          style={styles.menuModal}
          animationType="fade"
          visible={showMenu}
          transparent={true}
          onRequestClose={() => {
            setShowMenu(false);
          }}
        >
          <Menu folder2={route.params.folder2} setFolder={changeFolder} onClose={() => { setShowMenu(false) }} />
        </Modal>
      </SafeAreaView>
      <RBSheet
        ref={refRBSheet}
        openDuration={250}
        customStyles={{
          container: {
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            height: 250
          },
        }}>
        <BottomSheet
          onDelete={deleteCaseWrapper}
          onRename={renameCaseWraper}
          onShare={share}
          onChangefolder={moveToOtherFolder}
        />
      </RBSheet>

      <TouchableOpacity style={styles.fab} onPress={addNew}>
        <Icon style={styles.fabIcon} name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listItemContainer: {
    borderBottomWidth: 1,
    borderColor: '#C8C8C8',
  },
  listItemInnerContainer: {
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  listText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: values.green_color,
  },
  fab: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    position: 'absolute',
    bottom: 10,
    right: 10,
    height: 70,
    backgroundColor: values.blue_color,
    borderRadius: 100,
  },
  fabIcon: {
    color: values.gold_color,
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
  menuModal: {

    backgroundColor: "green"
  },
});

export default HomeScreen;
