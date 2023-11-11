

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

 

    function showFollowPosts() {
    fetch('/follow_posts')
      .then(response => response.json())
      .then(data => {
        const postContainer = document.querySelector('#postContainer');
        data.forEach(post => { 
        });
      });
    }
      

  

});

