import './App.css';
import {useEffect, useState} from "react";
import Post from "./Post";
import {Button, Input} from "@mui/material";
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import ImageUpload from "./ImageUpload";


const paperStyle = {
  position: 'absolute',
  width: 400,
  border: '2px solid #000',
  padding: (theme) => theme.spacing(2, 4, 3),
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)'
}


export const BASE_URL = 'http://localhost:8000';


function App() {

  const [posts, setPosts] = useState([]);
  const [openSignIn, setOpenSignIn] = useState(false);
  const [opneSignUp, setOpenSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authToken, setAuthToken] = useState(null);
  const [authTokenType, setAuthTokenType] = useState(null);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    setAuthToken(window.localStorage.getItem("authToken"));
    setAuthTokenType(window.localStorage.getItem('authTokenType'));
    setUsername(window.localStorage.getItem('username'));
    setUserId(window.localStorage.getItem('userId'));
  }, []);

  useEffect(() => {
    authToken
      ? localStorage.setItem('authToken', authToken)
      : localStorage.removeItem('authToken');
    authTokenType
      ? localStorage.setItem("authTokenType", authTokenType)
      : localStorage.removeItem("authTokenType");
    username
      ? localStorage.setItem('username', username)
      : localStorage.removeItem('username');
    userId
      ? localStorage.setItem('userId', userId)
      : localStorage.removeItem('userId');
  }, [authToken, authTokenType, userId]);

  useEffect(() => {
    fetch(BASE_URL + '/posts')
      .then(res => {
        const json = res.json();
        console.log(json);
        if (res.ok) {
          return json;
        }
        throw res;
      })
      .then(data => {
        const result = data.sort((a, b) => {
          const t_a = a.timestamp.split(/[-T:]/);
          const t_b = b.timestamp.split(/[-T:]/);
          const d_a = new Date(Date.UTC(t_a[0], t_a[1] - 1, t_a[2], t_a[3], t_a[4], t_a[5]))
          const d_b = new Date(Date.UTC(t_b[0], t_b[1] - 1, t_b[2], t_b[3], t_b[4], t_b[5]))
          return d_b - d_a;
        })
        return result;
      })
      .then(data => setPosts(data))
      .catch(err => console.log(err))
  }, []);

  const signIn = e => {
    e?.preventDefault();

    let formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const requestOptions = {
      method: 'POST',
      body: formData
    };

    fetch(BASE_URL + '/login', requestOptions)
      .then(res => {
        const json = res.json();
        console.log(json);
        if (res.ok) {
          return json;
        }
        throw res;
      })
      .then(data => {
        setAuthToken(data.access_token);
        setAuthTokenType(data.token_type);
        setUserId(data.user_id);
        setUsername(data.username);
      })
      .catch(err => console.log(err))

    setOpenSignIn(false);
  }

  const signOut = e => {
    setAuthToken(null);
    setAuthTokenType(null);
    setUserId('');
    setUsername('');
  }

  const signUp = e => {
    e?.preventDefault();

    const json_string = JSON.stringify({username, email, password});

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: json_string
    };

    fetch(BASE_URL + '/user', requestOptions)
      .then(res => {
        const json = res.json();
        console.log(json);
        if (res.ok) {
          return json;
        }
        throw res;
      })
      .then(data => {
        signIn();

      })
      .catch(err => console.log(err))

    setOpenSignUp(false);
  }


  return (
    <div className="app">

      <Modal open={openSignIn} onClose={() => setOpenSignIn(false)}>
        <Paper
          elevation={5}
          sx={paperStyle}
        >
          <form className="app_signin">
            <center>
              <img
                className="app_headerImage"
                src="https://cdn.icon-icons.com/icons2/2699/PNG/512/instagram_logo_icon_170643.png"
                alt="Instagram"
              />
            </center>
            <Input
              placeholder="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <Input
              placeholder="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              onClick={signIn}
            >
              Login
            </Button>
          </form>
        </Paper>
      </Modal>


      <Modal open={opneSignUp} onClose={() => setOpenSignUp(false)}>
        <Paper
          elevation={5}
          sx={paperStyle}
        >
          <form className="app_signin">
            <center>
              <img
                className="app_headerImage"
                src="https://cdn.icon-icons.com/icons2/2699/PNG/512/instagram_logo_icon_170643.png"
                alt="Instagram"
              />
            </center>
            <Input
              placeholder="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <Input
              placeholder='email'
              type='text'
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Input
              placeholder="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              onClick={signUp}
            >
              Sign Up
            </Button>
          </form>
        </Paper>
      </Modal>

      <div className="app_header">
        <img
          className="app_headerImage"
          src="https://cdn.icon-icons.com/icons2/2699/PNG/512/instagram_logo_icon_170643.png"
          alt="Instagram"
        />
        {authToken ? (
          <Button onClick={() => signOut()}>Logout</Button>
        ) : (
          <div>
            <Button onClick={() => setOpenSignIn(true)}>Login</Button>
            <Button onClick={() => setOpenSignUp(true)}>SignUp</Button>
          </div>
        )
        }
      </div>
      <div className='app_posts'>
        {posts.map(post => (
          <Post
            post={post}
            key={post.id}
            authToken={authToken}
            authTokenType={authTokenType}
            username={username}
          />
        ))}
      </div>

      {
        authToken ? (
          <ImageUpload
            authToken={authToken}
            authTokenType={authTokenType}
            userId={userId}
          />
        ) : (
          <h3>You need to login to upload</h3>
        )
      }

    </div>
  );
}

export default App;
