import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, Button, Image,TouchableOpacity } from 'react-native';
import { useEffect, useRef, useState ,useCallback} from 'react';
import { Camera } from 'expo-camera';
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { useIsFocused } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'
import { Ionicons,  AntDesign , MaterialIcons } from '@expo/vector-icons';
import colors from '../utils/colors';
import * as Clipboard from 'expo-clipboard';



export default function CameraScreen() {
  let cameraRef = useRef();
  const isFocused = useIsFocused();
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();

  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);

  const [photo, setPhoto] = useState();
  const [text, setText] = useState();

  const copyToClipboard = useCallback(async () => {
    await Clipboard.setStringAsync(text);
}, [text]);

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
      setHasMediaLibraryPermission(galleryStatus.status == "granted");

    })
    ();


  }, []);

  if (hasCameraPermission === undefined) {
    return <Text>Requesting permissions...</Text>
  } else if (!hasCameraPermission) {
    return <Text>Permission for camera not granted. Please change this in settings.</Text>
  } else if(hasGalleryPermission == false){
    return <Text>No access to Interal Storage</Text>
  }


  const pickImage  = async() => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4,3],
      quality: 1,
      base64: true,

    })
    // console.log(result)

    if(!result.cancelled){
      setPhoto(result)
    }
  }

  let takePic = async () => {
    let options = {
      quality: 1,
      base64: true,
      exif: false
    };

    let newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto);
    // console.log(newPhoto.uri)
  };

  if (photo) {
    let sharePic = () => {
      shareAsync(photo.uri).then(() => {
        setPhoto(undefined);
      });
    };

    let savePhoto = () => {
      MediaLibrary.saveToLibraryAsync(photo.uri).then(() => {
        setPhoto(undefined);
      });
    };

    

    const convertToText = async () => {
      var myHeaders = new Headers();
      myHeaders.append("apikey", "helloworld");
      
      var formdata = new FormData();
      formdata.append("language", "eng");
      formdata.append("isOverlayRequired", "false");
      formdata.append("base64Image", 'data:image/jpeg;base64,' + photo.base64);
      formdata.append("iscreatesearchablepdf", "false");
      formdata.append("issearchablepdfhidetextlayer", "false");
      
      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow'
      };
      
      fetch("https://api.ocr.space/parse/image", requestOptions)
        .then(response => response.json())
        .then(result => {
          setPhoto(undefined)
          // console.log(typeof(result))
          setText(result.ParsedResults[0].ParsedText)
          console.log(result.ParsedResults[0].ParsedText)
        })
        .catch(error => console.log('error', error));
    }


    return (
      <SafeAreaView style={styles.container}>
        {/* <Image style={styles.preview} source={{ uri: "data:image/jpg;base64," + photo.base64 }} /> */}
        <Image style={styles.preview} source={{ uri: photo.uri }} />
        <View style={styles.editbuttonContainer}>
          {hasMediaLibraryPermission ? (
            <View style={styles.buttonText}>
              <AntDesign name="save" size={25} color={colors.primary}/>
              <Button title="Save" onPress={savePhoto}  color={colors.primary}/>
            </View>
          ) : undefined}
          
          <View style={styles.buttonText}>
              <AntDesign name="closecircleo" size={25} color={colors.primary}/>
              <Text>{" "}</Text>
              <Button title="Discard" color={colors.primary} onPress={() => setPhoto(undefined)} />
            </View>

            <View style={styles.buttonText}>
            <Ionicons name="scan" size={25} color={colors.primary} />
            <Text>{" "}</Text>
            <Button title="Detect" onPress={convertToText} color={colors.primary} />
            </View>

        </View>
      </SafeAreaView>
    );
  }



  return (
    text ? <View style={styles.container}>

    <View style={styles.textContainer}>
        <Text
            numberOfLines={10}
            style={styles.title}>{text}</Text>
    </View>
    <View flexDirection='row'>
    <TouchableOpacity
                onPress={() => setText(undefined)}
                style={styles.iconContainer}>
                <AntDesign name="back" size={24}
                    color={text !== "" ? colors.textColor : colors.textColorDisabled} />
            </TouchableOpacity>
    <TouchableOpacity
                onPress={copyToClipboard}
                disabled={text === ""}
                style={styles.iconContainer}>
                <MaterialIcons 
                    name="content-copy"
                    size={24} 
                    color={text !== "" ? colors.textColor : colors.textColorDisabled} />
            </TouchableOpacity>

    </View>
</View> :
    isFocused &&       <Camera style={styles.container} ref={cameraRef}>
    <View style={styles.buttonContainer}>
      <View style={styles.buttonText}>
        <Ionicons name="scan-circle" size={30} color={colors.primary} />
        <Button title="Scan" onPress={takePic}  color={colors.primary} />
      </View>
      <View style={styles.buttonText}>
        <AntDesign name="picture" size={30} color={colors.primary} />
        <Button title="Upload" onPress={pickImage}  color={colors.primary}/>
      </View>
    </View>
    <StatusBar style="auto" />
  </Camera>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    backgroundColor: '#fff',
    alignSelf: 'flex-end'
  },
  preview: {
    alignSelf: 'stretch',
    flex: 1
  },
  buttonContainer: {
    padding: 3,
    alignItems: "center",
    justifyContent: "space-around",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 60,
  },

  editbuttonContainer: {
    padding: 3,
    alignItems: "center",
    justifyContent: "space-around",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  editbuttonContainer: {
    padding: 3,
    alignItems: "center",
    justifyContent: "space-around",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 20,
  },

  buttonText: {
    color: "red",
    alignItems: "center",
    // fontWeight: 'bold',
    flexDirection: "row",
  },
  textContainer: {
    backgroundColor: colors.primary,
  }
});
