import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, Button, Image } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Camera } from 'expo-camera';
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { useIsFocused } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'

// var options =  { 
//   apikey: '5c12daff7588957',
//   language: 'eng', // Português
//   imageFormat: 'image/png', // Image Type (Only png ou gif is acceptable at the moment i wrote this)
//   isOverlayRequired: true
// };

export default function CameraScreen() {
  let cameraRef = useRef();
  const isFocused = useIsFocused();
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();

  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);

  const [photo, setPhoto] = useState();
  const [text, setText] = useState("");

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
      setHasMediaLibraryPermission(galleryStatus.status == "granted");

    })();

    // if(photo){

    // }
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
    console.log(result)

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
    console.log(newPhoto.uri)
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
      // formdata.append("url", "http://dl.a9t9.com/ocrbenchmark/eng.png");
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
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
    }




    return (
      <SafeAreaView style={styles.container}>
        {/* <Image style={styles.preview} source={{ uri: "data:image/jpg;base64," + photo.base64 }} /> */}
        <Image style={styles.preview} source={{ uri: photo.uri }} />
        <Button title="Share" onPress={sharePic} />
        {hasMediaLibraryPermission ? <Button title="Save" onPress={savePhoto} /> : undefined}
        <Button title="Discard" onPress={() => setPhoto(undefined)} />
        <Button title="Translate" onPress={convertToText} />
      </SafeAreaView>
    );
  }

  return (
    isFocused && <Camera style={styles.container} ref={cameraRef}>
    <View style={styles.buttonContainer}>
      <Button title="Take Pic" onPress={takePic} />
      <Button title="Upload image" onPress={pickImage} />
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
  }
});
