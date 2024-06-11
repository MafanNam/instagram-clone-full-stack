import "./ImageUpload.css"
import {useState} from "react";
import {Button} from "@mui/material";
import {BASE_URL} from "./App";


export default function ImageUpload({authToken, authTokenType, userId}) {

  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);

  function handleChange(e) {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  }

  function handleUpload(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('image', image);

    const requestOptions = {
      method: 'POST',
      body: formData,
      headers: new Headers({
        'Authorization': `${authTokenType} ${authToken}`
      })
    }

    fetch(BASE_URL + "/posts/image", requestOptions)
      .then(res => {
        const json = res.json();
        if (res.ok) {
          return json;
        }
        throw res;
      })
      .then(data => {
        console.log(data);
        // create post
        createPost(data.filename);
      })
      .catch(err => console.log(err))
      .finally(() => {
        setCaption('');
        setImage(null);
        document.getElementById('fileInput').value = null;
      })
  }

  const createPost = (imageUrl) => {

    const json_string = JSON.stringify({
      image_url: imageUrl,
      image_url_type: "relative",
      caption: caption,
      creator_id: userId,
    })

    const requestOptions = {
      method: 'POST',
      body: json_string,
      headers: new Headers({
        'Authorization': `${authTokenType} ${authToken}`,
        'Content-Type': 'application/json',
      })
    }

    fetch(BASE_URL + "/posts", requestOptions)
      .then(res => {
        const json = res.json();
        if (res.ok) {
          return json;
        }
        throw res;
      })
      .then(data => {
        console.log(data);
        window.location.reload();
        window.scrollTo(0, 0);
      })
      .catch(err => console.log(err))
  }

  return (
    <div className='imageupload'>
      <input
        type="text"
        placeholder='Enter a caption...'
        onChange={e => setCaption(e.target.value)}
      />
      <input
        type='file'
        id='fileInput'
        onChange={handleChange}
      />
      <Button className='imageupload__button' onClick={handleUpload}>
        Upload
      </Button>
    </div>
  )
}