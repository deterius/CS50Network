 // FOLLOW/UNFOLLOW USER
 $(document).ready(function() {
  // CSRF token
  function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');

  // Follow Button
  $('.follow_status_button').click(function(event) {
      event.preventDefault(); // Prevent the default behavior

      var followUser = $(this).data('username');
      var url = '/follow/' + followUser; // Update with the correct URL pattern

      // Select all buttons with the same data-username 
      var buttons = $('.follow_status_button').filter(function() {
          return $(this).data('username') === followUser;
      })

      $.ajax({
          url: url,
          method: 'POST',
          headers: {
            'X-CSRFToken': csrftoken
        },
          success: function(response) {
              buttons.each(function() {
                  if (response.following) {
                      $(this).val('Unfollow');
                      $(this).removeClass('btn-primary');
                      $(this).addClass('btn-danger');
                  } else {
                      $(this).val('Follow');
                      $(this).removeClass('btn-danger');
                      $(this).addClass('btn-primary');
                  }
              })
          },
          error: function() {
              alert('An error occurred. Please try again.');
          }
      });
  });

  // Like Button
  

});



document.addEventListener('DOMContentLoaded', function() {  
  // Function to update follow buttons for all posts of the user
  function updateFollowButtons(status, followUrl) {
    const allFollowButtons = document.querySelectorAll('.card-follow');
    allFollowButtons.forEach(button => {
      if (button.getAttribute('href') === followUrl) {
        button.textContent = status;
      }
    });
  }



  function showPosts() {
    // clear all the posts from the container
    const postContainer = document.querySelector('#postContainer');
    postContainer.innerHTML = ''; // Clear the previous contents
    
    fetch('/all_posts')
      .then(response => response.json())
      .then(data => {
        const postContainer = document.querySelector('#postContainer');
        data.forEach(post => {

          const card = document.createElement('div');
          card.classList.add('card', 'my-3');

          const cardBody = document.createElement('div');
          cardBody.classList.add('card-body');

          const cardTitle = document.createElement('h5');
          cardTitle.classList.add('card-title');

          // User profile
          const cardTitleLink = document.createElement('a');
          cardTitleLink.href = 'user/' + post.created_by;
          cardTitleLink.textContent = post.created_by;

          // Follow Form
          console.log(post.can_follow)
          const cardFollow = document.createElement('form')
          cardFollow.classList.add('follow-user-form')
          cardFollow.method = 'POST';
          cardFollow.action = 'follow/' + post.created_by;
          
          

          const cardCreated = document.createElement('h6');
          cardCreated.classList.add('card-subtitle', 'mb-2', 'text-muted');
          // Format the date
          const date = new Date(post.created);
          const formattedDate = date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
          cardCreated.textContent = formattedDate;

          const cardContent = document.createElement('p');
          cardContent.classList.add('card-text');
          cardContent.textContent = post.content;

          // Creates Forms
          const cardForm = document.createElement('form');
          cardForm.classList.add('like-post-form');
          cardForm.method = 'POST';
          cardForm.action = 'like_post/' + post.id + '/';

          const likeBigDiv = document.createElement('div')
          likeBigDiv.classList.add('row')

          const like1col = document.createElement('div')
          like1col.classList.add('col')
          like1col.id = 'col1'
          
          const like2col = document.createElement('div')
          like2col.classList.add('col')
          like2col.id = 'col2'

          const cardLikes = document.createElement('p');
          cardLikes.classList.add('card-text', 'like-count');
          cardLikes.textContent = post.likes;


          // JS way to get a CSRF token!
          const csrfToken = getCSRFToken(); // Get the CSRF token from a function
          appendCSRFToken(cardForm, csrfToken); // Append the CSRF token to the form

          const cardLike = document.createElement('a');
          cardLike.className = 'card-link';
          if (post.is_liked) {
            cardLike.textContent = '♥';
          } else {
            cardLike.textContent = '♡';
          }
          cardLike.href = "";

          like1col.appendChild(cardForm)
          cardForm.appendChild(cardLike)
          like2col.appendChild(cardLikes)
          likeBigDiv.appendChild(like1col)
          likeBigDiv.appendChild(like2col)

          cardLike.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent the default link behavior

            const formData = new FormData(cardForm);
            const url = cardForm.getAttribute('action');

            fetch(url, {
              method: 'POST',
              body: formData,
              headers: {
                'X-CSRFToken': getCSRFToken(),
              },
            })
              .then(response => response.json())
              .then(data => {
                if (data.likes != undefined) {
                  // Update the like link text based on the response
                  if (data.likes === 0) {
                    cardLike.textContent = '♡';
                  } else {
                    cardLike.textContent = '♥';
                  }
                }
                if (data.likes_count != undefined) {
                  cardLikes.textContent = data.likes_count;
                }

                // Update the like count
                retrieveLikeCount(post.id, cardLikes);
              })
              .catch(error => {
                console.log('Error:', error);
              });
          });

          // follow functions
          const csrfToken2 = getCSRFToken();
          appendCSRFToken(cardFollow, csrfToken2);
          
          const cardTitleFollow = document.createElement('a');
          if (post.can_follow){
            cardTitleFollow.className = 'card-follow';
            cardTitleFollow.href = `follow/${post.created_by}`;
            cardTitleFollow.textContent = post.following_user ? 'Unfollow' : 'Follow';
          }

          cardTitleFollow.addEventListener('click', (event) => {
            event.preventDefault();
            fetch(`follow/${post.created_by}`)
              .then(response => response.json())
              .then(data => {
                if (data.following != undefined) {
                  if (data.following) {
                    cardTitleFollow.textContent = 'Unfollow';
                    updateFollowButtons('Unfollow', `follow/${post.created_by}`);
                  } else {
                    cardTitleFollow.textContent = 'Follow';
                    updateFollowButtons('Follow', `follow/${post.created_by}`);
                  }
                }
              })
              .catch(error => {
                console.log('Error', error);
              });
          });

          cardBody.appendChild(cardTitleLink);
          cardBody.appendChild(cardFollow);
          cardFollow.appendChild(cardTitleFollow);
          cardBody.appendChild(cardTitle);
          cardBody.appendChild(cardCreated);
          cardBody.appendChild(cardContent);
          cardBody.appendChild(likeBigDiv);
          card.appendChild(cardBody);
          postContainer.appendChild(card);
        });
      });
  }

  function showFollowPosts() {
    // clear all the posts from the container
    const postContainer = document.querySelector('#postContainer');
    postContainer.innerHTML = ''; // Clear the previous contents
    
    fetch('/follow_posts')
      .then(response => response.json())
      .then(data => {
        const postContainer = document.querySelector('#postContainer');
        data.forEach(post => {

          const card = document.createElement('div');
          card.classList.add('card', 'my-3');

          const cardBody = document.createElement('div');
          cardBody.classList.add('card-body');

          const cardTitle = document.createElement('h5');
          cardTitle.classList.add('card-title');

          // User profile
          const cardTitleLink = document.createElement('a');
          cardTitleLink.href = 'user/' + post.created_by;
          cardTitleLink.textContent = post.created_by;

          // Follow Form
          console.log(post.can_follow)
          const cardFollow = document.createElement('form')
          cardFollow.classList.add('follow-user-form')
          cardFollow.method = 'POST';
          cardFollow.action = 'follow/' + post.created_by;
          
          

          const cardCreated = document.createElement('h6');
          cardCreated.classList.add('card-subtitle', 'mb-2', 'text-muted');
          // Format the date
          const date = new Date(post.created);
          const formattedDate = date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
          cardCreated.textContent = formattedDate;

          const cardContent = document.createElement('p');
          cardContent.classList.add('card-text');
          cardContent.textContent = post.content;

          // Creates Forms
          const cardForm = document.createElement('form');
          cardForm.classList.add('like-post-form');
          cardForm.method = 'POST';
          cardForm.action = 'like_post/' + post.id + '/';

          const likeBigDiv = document.createElement('div')
          likeBigDiv.classList.add('row')

          const like1col = document.createElement('div')
          like1col.classList.add('col')
          like1col.id = 'col1'
          
          const like2col = document.createElement('div')
          like2col.classList.add('col')
          like2col.id = 'col2'

          const cardLikes = document.createElement('p');
          cardLikes.classList.add('card-text', 'like-count');
          cardLikes.textContent = post.likes;


          // JS way to get a CSRF token!
          const csrfToken = getCSRFToken(); // Get the CSRF token from a function
          appendCSRFToken(cardForm, csrfToken); // Append the CSRF token to the form

          const cardLike = document.createElement('a');
          cardLike.className = 'card-link';
          if (post.is_liked) {
            cardLike.textContent = '♥';
          } else {
            cardLike.textContent = '♡';
          }
          cardLike.href = "";

          like1col.appendChild(cardForm)
          cardForm.appendChild(cardLike)
          like2col.appendChild(cardLikes)
          likeBigDiv.appendChild(like1col)
          likeBigDiv.appendChild(like2col)

          cardLike.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent the default link behavior

            const formData = new FormData(cardForm);
            const url = cardForm.getAttribute('action');

            fetch(url, {
              method: 'POST',
              body: formData,
              headers: {
                'X-CSRFToken': getCSRFToken(),
              },
            })
              .then(response => response.json())
              .then(data => {
                if (data.likes != undefined) {
                  // Update the like link text based on the response
                  if (data.likes === 0) {
                    cardLike.textContent = '♡';
                  } else {
                    cardLike.textContent = '♥';
                  }
                }
                if (data.likes_count != undefined) {
                  cardLikes.textContent = data.likes_count;
                }

                // Update the like count
                retrieveLikeCount(post.id, cardLikes);
              })
              .catch(error => {
                console.log('Error:', error);
              });
          });

          // follow functions
          const csrfToken2 = getCSRFToken();
          appendCSRFToken(cardFollow, csrfToken2);
          
          const cardTitleFollow = document.createElement('a');
          if (post.can_follow){
            cardTitleFollow.className = 'card-follow';
            cardTitleFollow.href = `follow/${post.created_by}`;
            cardTitleFollow.textContent = post.following_user ? 'Unfollow' : 'Follow';
          }

          cardTitleFollow.addEventListener('click', (event) => {
            event.preventDefault();
            fetch(`follow/${post.created_by}`)
              .then(response => response.json())
              .then(data => {
                if (data.following != undefined) {
                  if (data.following) {
                    cardTitleFollow.textContent = 'Unfollow';
                    updateFollowButtons('Unfollow', `follow/${post.created_by}`);
                  } else {
                    cardTitleFollow.textContent = 'Follow';
                    updateFollowButtons('Follow', `follow/${post.created_by}`);
                  }
                }
              })
              .catch(error => {
                console.log('Error', error);
              });
          });

          cardBody.appendChild(cardTitleLink);
          cardBody.appendChild(cardFollow);
          cardFollow.appendChild(cardTitleFollow);
          cardBody.appendChild(cardTitle);
          cardBody.appendChild(cardCreated);
          cardBody.appendChild(cardContent);
          cardBody.appendChild(likeBigDiv);
          card.appendChild(cardBody);
          postContainer.appendChild(card);
        });
      });
  }

  // Retrieve likes count
  function retrieveLikeCount(postId, likeCountElement) {
    fetch('/like_count/' + postId + '/')
      .then(response => response.json())
      .then(data => {
        if (data.likes_count !== undefined) {
          likeCountElement.textContent = data.likes_count;
        }
      })
      .catch(error => {
        console.log('Error: ', error);
      });
  }

  // Function to get the CSRF token from the cookies
  function getCSRFToken() {
    const name = 'csrftoken';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        return cookie.substring(name.length + 1);
      }
    }
    return null;
  }

  // Function to append the CSRF token to a form
  function appendCSRFToken(form, token) {
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrfmiddlewaretoken';
    csrfInput.value = token;
    form.appendChild(csrfInput);
  }

 
  


  // LIKE POST FUNCTION
  document.querySelectorAll('.like-form').forEach(function(form) {
      form.addEventListener('submit', function(event) {
          event.preventDefault(); // Prevent the default form submission
  
          var url = form.action;
  
          // Create a new XMLHttpRequest object
          var xhr = new XMLHttpRequest();
          xhr.open('POST', url, true);
          xhr.setRequestHeader('X-CSRFToken', form.elements['csrfmiddlewaretoken'].value);
  
          xhr.onreadystatechange = function() {
              if (xhr.readyState === XMLHttpRequest.DONE) {
                  if (xhr.status === 200) {
                      // Success: Update the like count
                      var response = JSON.parse(xhr.responseText);
                      var likeCount = response.likes;
                      var postId = form.getAttribute('data-post-id');
                      var likeCountElement = document.getElementById('like-count-' + postId);
                      likeCountElement.innerHTML = likeCount;
  
                      // change like button
                      var likeButton = document.getElementById('like-button-'+ postId);
                      if (likeButton.value == '♡') {
                          likeButton.value = '♥'; // Outline heart
                      } else {
                          likeButton.value = '♡'; // Filled heart
                      }
                      
  
                      // change update 
                  } else {
                      // Error: Display an error message
                      console.error('Error:', xhr.status, xhr.statusText);
                  }
              }
          };
  
          // Send the form data
          xhr.send(new FormData(form));
      });
  });

  // inner navigation
  const userPosts = document.querySelector('#user_posts');
  const allPosts = document.querySelector('#all_posts');
  const userPostsLink = document.querySelector('#user_posts_link')
  const allPostsLink = document.querySelector('#all_posts_link')

  // hide all posts on default
  allPosts.style.display = 'none';

  userPostsLink.addEventListener('click', function() {
    userPosts.style.display = 'block';
    allPosts.style.display = 'none';
  })

  allPostsLink.addEventListener('click', function() {
    userPosts.style.display = 'none';
    allPosts.style.display = 'block';
  })

});





