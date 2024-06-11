import "./Post.css";
import {useEffect, useState} from "react";
import {BASE_URL} from "./App";
import {Avatar, Button} from "@mui/material";


export default function Post({post, authToken, authTokenType, username}) {

  const [imageUrl, setImageUrl] = useState("");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (post.image_url_type === "absolute") {
      setImageUrl(post.image_url);
    } else {
      setImageUrl(`${BASE_URL}/${post.image_url}`)
    }
  }, [post.image_url, post.image_url_type]);

  useEffect(() => {
    setComments(post.comments);
  }, []);

  function handleDelete(e) {
    e.preventDefault();

    const requestOptions = {
      method: "DELETE",
      headers: new Headers({
        "Authorization": `${authTokenType} ${authToken}`
      }),
    }

    fetch(`${BASE_URL}/posts/${post.id}`, requestOptions)
      .then(res => {
        if (res.ok) {
          window.location.reload();
        }
        throw res;
      })
      .catch(err => console.log(err));

  }

  function postComment(e) {
    e?.preventDefault();

    const json_string = JSON.stringify({
      username: username,
      text: newComment,
      post_id: post.id,
    });

    const requestOptions = {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": `${authTokenType} ${authToken}`
      }),
      body: json_string
    }

    fetch(`${BASE_URL}/comments`, requestOptions)
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw res;
      })
      .then(data => fetchComments())
      .catch(err => console.log(err))
      .finally(() => {
        setNewComment("");
      })
  }

  const fetchComments = () => {
    fetch(`${BASE_URL}/comments/all/${post.id}`)
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw res;
      })
      .then(data => setComments(data))
      .catch(err => console.log(err));
  }

  return (
    <div className="post">
      <div className="post_header">
        <Avatar
          alt={post.user.username}
          src={imageUrl}
        />
        <div className='post_headerInfo'>
          <h3>{post.user.username}</h3>
          {authToken && post.user.username === username
            ? <Button className='post_delete' onClick={handleDelete}>Delete</Button>
            : null
          }
        </div>
      </div>

      <img className='post_image' src={imageUrl}/>

      <h4 className='post_text'>
        {post.caption}
      </h4>

      <div className='post_comments'>
        {comments.map(comment => (
          <p>
            <strong>{comment.username}:</strong> {comment.text}
          </p>
        ))}
      </div>

      {authToken && (
        <form className='post_commentbox'>
          <input
            className='post_input'
            placeholder='Add a comment...'
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            className='post_button'
            type="submit"
            disabled={!newComment}
            onClick={postComment}
          >
            Post
          </button>
        </form>
      )}
    </div>
  )
}


