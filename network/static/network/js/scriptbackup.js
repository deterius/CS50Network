

document.addEventListener('DOMContentLoaded', function() { 
  
  // OPEN TAB 
  // Define openTab inside DOMContentLoaded
  function openTab(tabId) {
    var i, tabcontent, tablinks;

    // Hide all tab content
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Remove 'active' class from all tabs
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    // Show the current tab content and add 'active' class to the clicked tab
    document.getElementById(tabId).style.display = "block";
    // Find the tab link that corresponds to the tabId and add 'active' class
    for (i = 0; i < tablinks.length; i++) {
        if (tablinks[i].getAttribute('onclick').includes(tabId)) {
            tablinks[i].classList.add("active");
        }
    }
}

    // Make openTab globally accessible
    window.openTab = openTab;

    // Open the default tab and set its link as active
    openTab('all_posts');

  // Follow/Unfollow USER
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
      event.stopPropagation() // stops the previous line to affect all others

      var followUser = $(this).data('username');
      var url = '/follow/' + followUser; // Update with the correct URL pattern

      // Select all buttons with the same data-username 
      var buttons = $('.follow_status_button').filter(function() {
          return $(this).data('username') === followUser;
      })

      // select follower count
      var followerCount = document.getElementById('follower-count')

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
                      $(this).removeClass('custom-button-follow');
                      $(this).addClass('custom-button-unfollow');
                  } else {
                      $(this).val('Follow');
                      $(this).removeClass('custom-button-unfollow');
                      $(this).addClass('custom-button-follow');
                  }
              })
              console.log(response)
              console.log(response.followers)
              followerCount.innerText = response.followers
          },
          error: function() {
              alert('An error occurred. Please try again.');
          }
      });
  });



  // Function to update follow buttons for all posts of the user
  function updateFollowButtons(status, followUrl) {
    const allFollowButtons = document.querySelectorAll('.card-follow');
    allFollowButtons.forEach(button => {
      if (button.getAttribute('href') === followUrl) {
        button.textContent = status;
      }
    });
  }



  // function showPosts() {
  //   // clear all the posts from the container
  //   const postContainer = document.querySelector('#postContainer');
  //   postContainer.innerHTML = ''; // Clear the previous contents
    
  //   fetch('/all_posts')
  //     .then(response => response.json())
  //     .then(data => {
  //       const postContainer = document.querySelector('#postContainer');
  //       data.forEach(post => {

  //         const card = document.createElement('div');
  //         card.classList.add('card', 'my-3');

  //         const cardBody = document.createElement('div');
  //         cardBody.classList.add('card-body');

  //         const cardTitle = document.createElement('h5');
  //         cardTitle.classList.add('card-title');

  //         // User profile
  //         const cardTitleLink = document.createElement('a');
  //         cardTitleLink.href = 'user/' + post.created_by;
  //         cardTitleLink.textContent = post.created_by;

  //         // Follow Form
  //         console.log(post.can_follow)
  //         const cardFollow = document.createElement('form')
  //         cardFollow.classList.add('follow-user-form')
  //         cardFollow.method = 'POST';
  //         cardFollow.action = 'follow/' + post.created_by;
          
          

  //         const cardCreated = document.createElement('h6');
  //         cardCreated.classList.add('card-subtitle', 'mb-2', 'text-muted');
  //         // Format the date
  //         const date = new Date(post.created);
  //         const formattedDate = date.toLocaleString('en-US', {
  //           year: 'numeric',
  //           month: '2-digit',
  //           day: '2-digit',
  //           hour: '2-digit',
  //           minute: '2-digit'
  //         })
  //         cardCreated.textContent = formattedDate;

  //         const cardContent = document.createElement('p');
  //         cardContent.classList.add('card-text');
  //         cardContent.textContent = post.content;

  //         // Creates Forms
  //         const cardForm = document.createElement('form');
  //         cardForm.classList.add('like-post-form');
  //         cardForm.method = 'POST';
  //         cardForm.action = 'like_post/' + post.id + '/';

  //         const likeBigDiv = document.createElement('div')
  //         likeBigDiv.classList.add('row')

  //         const like1col = document.createElement('div')
  //         like1col.classList.add('col')
  //         like1col.id = 'col1'
          
  //         const like2col = document.createElement('div')
  //         like2col.classList.add('col')
  //         like2col.id = 'col2'

  //         const cardLikes = document.createElement('p');
  //         cardLikes.classList.add('card-text', 'like-count');
  //         cardLikes.textContent = post.likes;


  //         // JS way to get a CSRF token!
  //         const csrfToken = getCSRFToken(); // Get the CSRF token from a function
  //         appendCSRFToken(cardForm, csrfToken); // Append the CSRF token to the form

  //         const cardLike = document.createElement('a');
  //         cardLike.className = 'card-link';
  //         if (post.is_liked) {
  //           cardLike.textContent = '♥';
  //         } else {
  //           cardLike.textContent = '♡';
  //         }
  //         cardLike.href = "";

  //         like1col.appendChild(cardForm)
  //         cardForm.appendChild(cardLike)
  //         like2col.appendChild(cardLikes)
  //         likeBigDiv.appendChild(like1col)
  //         likeBigDiv.appendChild(like2col)

  //         cardLike.addEventListener('click', (event) => {
  //           event.preventDefault(); // Prevent the default link behavior
  //           event.stopPropagation() // stops the previous line to affect all others

  //           const formData = new FormData(cardForm);
  //           const url = cardForm.getAttribute('action');

  //           fetch(url, {
  //             method: 'POST',
  //             body: formData,
  //             headers: {
  //               'X-CSRFToken': getCSRFToken(),
  //             },
  //           })
  //             .then(response => response.json())
  //             .then(data => {
  //               if (data.likes != undefined) {
  //                 // Update the like link text based on the response
  //                 if (data.likes === 0) {
  //                   cardLike.textContent = '♡';
  //                 } else {
  //                   cardLike.textContent = '♥';
  //                 }
  //               }
  //               if (data.likes_count != undefined) {
  //                 cardLikes.textContent = data.likes_count;
  //               }

  //               // Update the like count
  //               retrieveLikeCount(post.id, cardLikes);
  //             })
  //             .catch(error => {
  //               console.log('Error:', error);
  //             });
  //         });

  //         // follow functions
  //         const csrfToken2 = getCSRFToken();
  //         appendCSRFToken(cardFollow, csrfToken2);
          
  //         const cardTitleFollow = document.createElement('a');
  //         if (post.can_follow){
  //           cardTitleFollow.className = 'card-follow';
  //           cardTitleFollow.href = `follow/${post.created_by}`;
  //           cardTitleFollow.textContent = post.following_user ? 'Unfollow' : 'Follow';
  //         }

  //         cardTitleFollow.addEventListener('click', (event) => {
  //           event.preventDefault();
  //           event.stopPropagation() // stops the previous line to affect all others
  //           fetch(`follow/${post.created_by}`)
  //             .then(response => response.json())
  //             .then(data => {
  //               if (data.following != undefined) {
  //                 if (data.following) {
  //                   cardTitleFollow.textContent = 'Unfollow';
  //                   updateFollowButtons('Unfollow', `follow/${post.created_by}`);
  //                 } else {
  //                   cardTitleFollow.textContent = 'Follow';
  //                   updateFollowButtons('Follow', `follow/${post.created_by}`);
  //                 }
  //               }
  //             })
  //             .catch(error => {
  //               console.log('Error', error);
  //             });
  //         });

  //         cardBody.appendChild(cardTitleLink);
  //         cardBody.appendChild(cardFollow);
  //         cardFollow.appendChild(cardTitleFollow);
  //         cardBody.appendChild(cardTitle);
  //         cardBody.appendChild(cardCreated);
  //         cardBody.appendChild(cardContent);
  //         cardBody.appendChild(likeBigDiv);
  //         card.appendChild(cardBody);
  //         postContainer.appendChild(card);
  //       });
  //     });
  // }



  // Retrieve likes count
  // function retrieveLikeCount(postId, likeCountElement) {
  //   fetch('/like_count/' + postId + '/')
  //     .then(response => response.json())
  //     .then(data => {
  //       if (data.likes_count !== undefined) {
  //         likeCountElement.textContent = data.likes_count;
  //       }
  //     })
  //     .catch(error => {
  //       console.log('Error: ', error);
  //     });
  // }

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
//   document.querySelectorAll('.like-form').forEach(function(form) {
//     form.addEventListener('submit', function(event) {
//         event.preventDefault(); // Prevent the default form submission

//         var url = form.action;

//         // Create a new XMLHttpRequest object
//         var xhr = new XMLHttpRequest();
//         xhr.open('POST', url, true);
//         xhr.setRequestHeader('X-CSRFToken', form.elements['csrfmiddlewaretoken'].value);

//         xhr.onreadystatechange = function() {
//             if (xhr.readyState === XMLHttpRequest.DONE) {
//                 if (xhr.status === 200) {
//                     // Success: Update the like count
//                     var response = JSON.parse(xhr.responseText);
//                     var likeCount = response.likes;
//                     var postId = form.getAttribute('data-post-id');
//                     var likeCountElement = document.getElementById('like-count-' + postId);
//                     likeCountElement.innerHTML = likeCount;

//                     // change like button
//                     var likeButton = document.getElementById('like-button-'+ postId);
//                     if (likeButton.value == '♡') {
//                         likeButton.value = '♥'; // Outline heart
//                     } else {
//                         likeButton.value = '♡'; // Filled heart
//                     }
                    

//                     // change update 
//                 } else {
//                     // Error: Display an error message
//                     console.error('Error:', xhr.status, xhr.statusText);
//                 }
//             }
//         };

//         // Send the form data
//         xhr.send(new FormData(form));
//     });
// });
// new one:
  let likeForms = document.querySelectorAll('.like-form')
  likeForms.forEach(function(form){
    form.addEventListener('submit', function(event){
      event.preventDefault();
      event.stopPropagation() // stops the previous line to affect all others

      let postId = form.getAttribute('data-post-id');
      let allPostsLikeButton = document.getElementById(`all_posts-like-button-${postId}`);
      let userPostsLikeButton = document.getElementById(`user_posts-like-button-${postId}`);
      let allPostsLikeCountDiv = document.getElementById(`all_posts-like-count-${postId}`);
      let userPostsLikeCountDiv = document.getElementById(`user_posts-like-count-${postId}`);

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': form.querySelector('[name=csrfmiddlewaretoken]').value
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error ('Like Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.likes !== undefined){
          if (allPostsLikeCountDiv) {
              allPostsLikeCountDiv.textContent = data.likes;
          }
          if (userPostsLikeCountDiv) {
              userPostsLikeCountDiv.textContent = data.likes;
          }
      }

          if (allPostsLikeButton) {
            if (allPostsLikeButton.value == '♡') {
                allPostsLikeButton.value = '♥'; // Outline heart
            } else {
                allPostsLikeButton.value = '♡'; // Filled heart
            }
        }
      
        if (userPostsLikeButton) {
            if (userPostsLikeButton.value == '♡') {
                userPostsLikeButton.value = '♥'; // Outline heart
            } else {
                userPostsLikeButton.value = '♡'; // Filled heart
            }
        }
         
      })
      .catch(error => {
        console.error('There was a like error: ', error)
      })
    })
  })


 

  



  // POSTS inner navigation
  const userPosts = document.querySelector('#user_posts');
  const allPosts = document.querySelector('#all_posts');
  const followingPosts = document.querySelector('#following_posts');
  
  const userPostsLink = document.querySelector('#user_posts_link')
  const allPostsLink = document.querySelector('#all_posts_link')
  const followingPostsLink = document.querySelector('#following_posts_link')

  // hide all posts on default
  allPosts.style.display = 'none';

  userPostsLink.addEventListener('click', function() {
    userPosts.style.display = 'block';
    allPosts.style.display = 'none';
    followingPosts.style.display = 'none';
  })

  allPostsLink.addEventListener('click', function() {
    userPosts.style.display = 'none';
    allPosts.style.display = 'block';
    followingPosts.style.display = 'none';
  })

  followingPostsLink.addEventListener('click', function() {
    userPosts.style.display = 'none';
    allPosts.style.display = 'none';
    followingPosts.style.display = 'block';
  })


  // NEW post div
  var newPostDiv = document.querySelector('#new_post_div')
  var new_posts_button = document.querySelector('#new_posts_button')
  new_posts_button.addEventListener('click', function(){
    if (newPostDiv.style.opacity === '0' || newPostDiv.style.opacity === '') {
      newPostDiv.style.display = 'block';
      
      // Ensure the block gets rendered before setting opacity & visibility
      setTimeout(function() {
          newPostDiv.style.opacity = '1';
          newPostDiv.style.transform = 'translateY(0)';
          newPostDiv.style.visibility = 'visible';
      }, 1);  // 1ms delay
    } else {
        newPostDiv.style.opacity = '0';
        newPostDiv.style.transform = 'translateY(-10px)';
        
        // Wait for the transition to finish then set display to none
        setTimeout(function() {
            if (newPostDiv.style.opacity === '0') {
                newPostDiv.style.display = 'none';
                newPostDiv.style.visibility = 'hidden';
            }
        }, 300);  // Same delay as your transition
    }
  })

  //  Following posts:
  // $('#following_posts_link').click(function(event){
  //   fetch('following_user_post')
  //   .then(response => {
  //       if (!response.ok) {
  //           throw new Error("Network response was not ok");
  //       }
  //       return response.json();
  //   })
  //   .then(data => {
  //       const postContainer = document.querySelector('#following_posts');
  //       console.log(data);
  //       data.data.forEach(post => {
  //           console.log(post);

  //           // create a create element function
  //           function createElem(tag, ...classNames) {
  //             const elem = document.createElement(tag)
  //             if (classNames.length) elem.classList.add(...classNames);
  //             return elem
  //           }

  //           // Append child elements:
  //           function appendChildren(parent, ...children) {
  //             children.forEach(child => {
  //                 parent.appendChild(child);
  //             });
  //         }

  //           const card = createElem('div', 'card', 'my-3');
  //           const cardBody = createElem('div', 'card-body');
  //           const cardRow = createElem('div', 'row');
  //           const cardCol = createElem('div', 'col-auto');
  //           const cardTitle = createElem('div', 'card-title');
  //           const cardTitleLink = createElem('a')
  //           cardTitleLink.href = 'user/' + post.created_by;
  //           cardTitleLink.textContent = post.created_by;
  //           const cardCol2 = createElem('div', 'col-auto')
  //           const cardCreated = createElem('div','text-muted','small','mb-3' )
  //           // Format the date
  //           const date = new Date(post.created);
  //           const formattedDate = date.toLocaleString('en-US', {
  //             year: 'numeric',
  //             month: '2-digit',
  //             day: '2-digit',
  //             hour: '2-digit',
  //             minute: '2-digit'
  //           })
  //           cardCreated.textContent = formattedDate;

  //           // add the posts html tags to postcontainer
  //           appendChildren(postContainer, card)
  //           appendChildren(card, cardBody)
  //           appendChildren(cardBody, cardRow)
  //           appendChildren(cardRow, cardCol, cardCol2)
  //           appendChildren(cardCol, cardTitle)
  //           appendChildren(cardTitle, cardTitleLink)
  //           appendChildren(cardCol2, cardCreated)
  //       });
  //   })
  //   .catch(error => {
  //       console.error("There was a problem with the fetch operation:", error.message);
  //   });
  // })


    function showFollowPosts() {
    fetch('/follow_posts')
      .then(response => response.json())
      .then(data => {
        console.log('HELLO')
        const postContainer = document.querySelector('#postContainer');
        data.forEach(post => { 
        });
      });
    }
      

          // const card = document.createElement('div');
          // card.classList.add('card', 'my-3');

          // const cardBody = document.createElement('div');
          // cardBody.classList.add('card-body');

          // const cardTitle = document.createElement('h5');
          // cardTitle.classList.add('card-title');

          // // User profile
          // const cardTitleLink = document.createElement('a');
          // cardTitleLink.href = 'user/' + post.created_by;
          // cardTitleLink.textContent = post.created_by;

          // // Follow Form
          // console.log(post.can_follow)
          // const cardFollow = document.createElement('form')
          // cardFollow.classList.add('follow-user-form')
          // cardFollow.method = 'POST';
          // cardFollow.action = 'follow/' + post.created_by;
          
          

  //         const cardCreated = document.createElement('h6');
  //         cardCreated.classList.add('card-subtitle', 'mb-2', 'text-muted');
  //         // Format the date
  //         const date = new Date(post.created);
  //         const formattedDate = date.toLocaleString('en-US', {
  //           year: 'numeric',
  //           month: '2-digit',
  //           day: '2-digit',
  //           hour: '2-digit',
  //           minute: '2-digit'
  //         })
  //         cardCreated.textContent = formattedDate;

  //         const cardContent = document.createElement('p');
  //         cardContent.classList.add('card-text');
  //         cardContent.textContent = post.content;

  //         // Creates Forms
  //         const cardForm = document.createElement('form');
  //         cardForm.classList.add('like-post-form');
  //         cardForm.method = 'POST';
  //         cardForm.action = 'like_post/' + post.id + '/';

  //         const likeBigDiv = document.createElement('div')
  //         likeBigDiv.classList.add('row')

  //         const like1col = document.createElement('div')
  //         like1col.classList.add('col')
  //         like1col.id = 'col1'
          
  //         const like2col = document.createElement('div')
  //         like2col.classList.add('col')
  //         like2col.id = 'col2'

  //         const cardLikes = document.createElement('p');
  //         cardLikes.classList.add('card-text', 'like-count');
  //         cardLikes.textContent = post.likes;


  //         // JS way to get a CSRF token!
  //         const csrfToken = getCSRFToken(); // Get the CSRF token from a function
  //         appendCSRFToken(cardForm, csrfToken); // Append the CSRF token to the form

  //         const cardLike = document.createElement('a');
  //         cardLike.className = 'card-link';
  //         if (post.is_liked) {
  //           cardLike.textContent = '♥';
  //         } else {
  //           cardLike.textContent = '♡';
  //         }
  //         cardLike.href = "";

  //         like1col.appendChild(cardForm)
  //         cardForm.appendChild(cardLike)
  //         like2col.appendChild(cardLikes)
  //         likeBigDiv.appendChild(like1col)
  //         likeBigDiv.appendChild(like2col)

  //         cardLike.addEventListener('click', (event) => {
  //           event.preventDefault(); // Prevent the default link behavior
  //           event.stopPropagation() // stops the previous line to affect all others

  //           const formData = new FormData(cardForm);
  //           const url = cardForm.getAttribute('action');

  //           fetch(url, {
  //             method: 'POST',
  //             body: formData,
  //             headers: {
  //               'X-CSRFToken': getCSRFToken(),
  //             },
  //           })
  //             .then(response => response.json())
  //             .then(data => {
  //               if (data.likes != undefined) {
  //                 // Update the like link text based on the response
  //                 if (data.likes === 0) {
  //                   cardLike.textContent = '♡';
  //                 } else {
  //                   cardLike.textContent = '♥';
  //                 }
  //               }
  //               if (data.likes_count != undefined) {
  //                 cardLikes.textContent = data.likes_count;
  //               }

  //               // Update the like count
  //               retrieveLikeCount(post.id, cardLikes);
  //             })
  //             .catch(error => {
  //               console.log('Error:', error);
  //             });
  //         });

  //         // follow functions
  //         const csrfToken2 = getCSRFToken();
  //         appendCSRFToken(cardFollow, csrfToken2);
          
  //         const cardTitleFollow = document.createElement('a');
  //         if (post.can_follow){
  //           cardTitleFollow.className = 'card-follow';
  //           cardTitleFollow.href = `follow/${post.created_by}`;
  //           cardTitleFollow.textContent = post.following_user ? 'Unfollow' : 'Follow';
  //         }

  //         cardTitleFollow.addEventListener('click', (event) => {
  //           event.preventDefault();
  //           event.stopPropagation() // stops the previous line to affect all others

  //           fetch(`follow/${post.created_by}`)
  //             .then(response => response.json())
  //             .then(data => {
  //               if (data.following != undefined) {
  //                 if (data.following) {
  //                   cardTitleFollow.textContent = 'Unfollow';
  //                   updateFollowButtons('Unfollow', `follow/${post.created_by}`);
  //                 } else {
  //                   cardTitleFollow.textContent = 'Follow';
  //                   updateFollowButtons('Follow', `follow/${post.created_by}`);
  //                 }
  //               }
  //             })
  //             .catch(error => {
  //               console.log('Error', error);
  //             });
  //         });

  //         cardBody.appendChild(cardTitleLink);
  //         cardBody.appendChild(cardFollow);
  //         cardFollow.appendChild(cardTitleFollow);
  //         cardBody.appendChild(cardTitle);
  //         cardBody.appendChild(cardCreated);
  //         cardBody.appendChild(cardContent);
  //         cardBody.appendChild(likeBigDiv);
  //         card.appendChild(cardBody);
  //         postContainer.appendChild(card);
  //       });
  //     });
  // }
  

});

