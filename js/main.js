
// Initialize App
document.addEventListener('DOMContentLoaded', function () {
    // Check login
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser && window.location.pathname.includes('home.html')) {
        window.location.href = 'index.html';
        return;
    }

    // Setup pages
    if (window.location.pathname.includes('index.html')) {
        setupLogin();
        setupGenderSelection();
    }
    else if (window.location.pathname.includes('home.html')) {
        displayPosts(currentUser);
    }

    setupSearchFocus();

    // Enable bootstrap popover
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
    const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
});

// Gender Selection
function setupGenderSelection() {
    const femaleBtn = document.querySelector('#female');
    const maleBtn = document.querySelector('#male');
    const customBtn = document.querySelector('#custom');
    const genderCustom = document.querySelector('#gender-custom');

    if (femaleBtn && maleBtn && customBtn && genderCustom) {
        femaleBtn.addEventListener('change', () => genderCustom.classList.add('d-none'));
        maleBtn.addEventListener('change', () => genderCustom.classList.add('d-none'));
        customBtn.addEventListener('change', () => genderCustom.classList.remove('d-none'));
    }
}

// Search Focus
function setupSearchFocus() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(trigger => {
            trigger.addEventListener('click', () => setTimeout(() => searchInput.focus(), 200));
        });
    }
}

// Login Function
function setupLogin() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const response = await fetch(`http://localhost:3001/users?email=${email}`);
        if (!response.ok) {
            alert('Network error!');
            return;
        }

        const users = await response.json();

        if (users.length === 0) {
            alert('User not found!');
            return;
        }

        if (users[0].password !== password) {
            alert('Wrong password!');
            return;
        }

        localStorage.setItem('currentUser', JSON.stringify(users[0]));
        window.location.href = 'home.html';
    });
}

// fetch a user by ID
async function fetchUser(userId) {
    const response = await fetch(`http://localhost:3001/users/${userId}`);
    const user = await response.json();
    return user;
}

// fetch comments for a post
async function fetchComments(postId) {

    const response = await fetch(`http://localhost:3001/comments?postId=${postId}`);

    return await response.json();

}

// fetch posts 
async function fetchPosts() {
    const response = await fetch('http://localhost:3001/posts');
    const posts = await response.json();

    const completePosts = [];

    // Fetch related data for each post
    for (const post of posts) {

        const postUser = await fetchUser(post.userId);
        const postComments = await fetchComments(post.id);

        // comments with user data
        const commentsWithUsers = [];
        for (const comment of postComments) {
            const commentUser = await fetchUser(comment.userId);
            commentsWithUsers.push({
                ...comment,        //spread all comment properties -> id,content
                user: commentUser  // add user object to the comment
            });
        }

        //collect data in one object
        completePosts.push({
            ...post,    // include all original post data
            user: postUser, // add user who wrote the post
            comments: commentsWithUsers, //add comments with its users
        });
    }

    return completePosts;
}

// generate HTML for a single post
function createPostHTML(post, currentUser) {
    return `
        <div class="bg-white p-4 rounded shadow mt-3">
            <!-- user -->
            <div class="d-flex justify-content-between">
                <!-- avatar -->
                <div class="d-flex">
                    <img src="${post.user.avatar}" 
                        alt="avatar" class="rounded-circle me-2"
                        style="width: 38px; height: 38px; object-fit: cover" />
                    <div>
                        <p class="m-0 fw-bold">${post.user.name}</p>
                    </div>
                </div>
                <!-- edit -->
                <i class="fas fa-ellipsis-h" type="button" id="post${post.id}Menu" data-bs-toggle="dropdown"
                    aria-expanded="false"></i>
                <!-- edit menu -->
                <ul class="dropdown-menu border-0 shadow" aria-labelledby="post${post.id}Menu">
                    <li class="d-flex align-items-center">
                        <a class="dropdown-item d-flex justify-content-around align-items-center fs-7"
                            href="#">
                            Edit Post
                        </a>
                    </li>
                    <li class="d-flex align-items-center">
                        <a class="dropdown-item d-flex justify-content-around align-items-center fs-7"
                            href="#">
                            Delete Post
                        </a>
                    </li>
                </ul>
            </div>
            <!-- post content -->
            <div class="mt-3">
                <!-- content -->
                <div>
                    <p>${post.content}</p>
                    <img src="${post.image}" alt="post image" class="img-fluid rounded" />
                </div>
                <!-- likes & comments -->
                <div class="post__comment mt-3 position-relative">
                    <!-- likes -->
                    <div class="d-flex align-items-center top-0 start-0 position-absolute"
                        style="height: 50px; z-index: 5">
                        <div class="me-2">
                            <i class="text-primary fas fa-thumbs-up"></i>
                            <i class="text-danger fab fa-gratipay"></i>
                            <i class="text-warning fas fa-grin-squint"></i>
                        </div>
                        <p class="m-0 text-muted fs-7">${post.likes}</p>
                    </div>
                    <!-- comments start-->
                    <div class="accordion" id="accordionExample${post.id}">
                        <div class="accordion-item border-0">
                            <!-- comment collapse -->
                            <h2 class="accordion-header" id="headingTwo${post.id}">
                                <div class="accordion-button collapsed pointer d-flex justify-content-end"
                                    data-bs-toggle="collapse" data-bs-target="#collapsePost${post.id}"
                                    aria-expanded="false" aria-controls="collapsePost${post.id}">
                                    <p class="m-0">${post.comments.length} Comments</p>
                                </div>
                            </h2>
                            <hr />
                            <!-- comment & like bar -->
                            <div class="d-flex justify-content-around">
                                <div class="dropdown-item rounded d-flex justify-content-center align-items-center pointer text-muted p-1 like-btn" data-post-id="${post.id}">
                                    <i class="fas fa-thumbs-up me-3"></i>
                                    <p class="m-0">Like</p>
                                </div>
                                <div class="dropdown-item rounded d-flex justify-content-center align-items-center pointer text-muted p-1"
                                    data-bs-toggle="collapse" data-bs-target="#collapsePost${post.id}"
                                    aria-expanded="false" aria-controls="collapsePost${post.id}">
                                    <i class="fas fa-comment-alt me-3"></i>
                                    <p class="m-0">Comment</p>
                                </div>
                            </div>
                            <!-- comment expand -->
                            <div id="collapsePost${post.id}" class="accordion-collapse collapse"
                                aria-labelledby="headingTwo${post.id}" data-bs-parent="#accordionExample${post.id}">
                                <hr />
                                <div class="accordion-body">
                                    ${post.comments.map(comment => `
                                        <!-- comment -->
                                        <div class="d-flex align-items-center my-1">
                                            <!-- avatar -->
                                            <img src="${comment.user.avatar}" 
                                                alt="avatar" class="rounded-circle me-2"
                                                style="width: 38px; height: 38px; object-fit: cover;" />
                                            <!-- comment text -->
                                            <div class="p-3 rounded comment__input w-100 bg-grey">
                                                <p class="fw-bold m-0">${comment.user.name}</p>
                                                <p class="m-0 fs-7 p-2 rounded">
                                                    ${comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    `).join('')}
                                    <!-- create comment -->
                                    <form class="d-flex my-1 comment-form" data-post-id="${post.id}">
                                        <!-- avatar -->
                                        <div>
                                            <img src="${currentUser.avatar}" 
                                                alt="avatar" class="rounded-circle me-2"
                                                style="width: 38px; height: 38px; object-fit: cover;" />
                                        </div>
                                        <!-- input -->
                                        <input type="text" name="comment" required
                                            class="form-control border-0 rounded-pill bg-grey"
                                            placeholder="Write a comment" />
                                        <button type="submit" class="d-none">Submit</button>
                                    </form>
                                    <!-- end -->
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- end -->
                </div>
            </div>
        </div>
    `;
}

// display all posts
async function displayPosts(currentUser) {
    const posts = await fetchPosts();
    const postsList = document.getElementById('postsList');

    postsList.innerHTML = posts.map(post => createPostHTML(post, currentUser)).join('');

    // Add event listeners after dispaly
    addEventListeners(currentUser);
}

// handle like
async function handleLike(postId,currentUser) {
    // Fetch current post
    const response = await fetch(`http://localhost:3001/posts/${postId}`);

    const post = await response.json();

    // Update likes count
    const updatedPost = {
        ...post,
        likes: post.likes + 1
    };

    // Send PUT request
    const updateResponse = await fetch(`http://localhost:3001/posts/${postId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedPost)
    });

    // Refresh posts
    displayPosts(currentUser);
}

//handle comment
async function handleComment(postId, content, currentUser) {

    // Create new comment
    const newComment = {
        postId: parseInt(postId),
        userId: currentUser.id,
        content: content,
        createdAt: new Date().toISOString()
    };

    // Send POST request
    const response = await fetch('http://localhost:3001/comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newComment)
    });

    // Refresh posts
    displayPosts(currentUser);
}

// Add event listeners
function addEventListeners(currentUser) {
    // Like buttons
    document.querySelectorAll('.like-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            console.log(e.currentTarget);
            const postId = e.currentTarget.getAttribute('data-post-id');
            handleLike(postId, currentUser);
        });
    });

    // Comment forms
    document.querySelectorAll('.comment-form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const postId = e.currentTarget.getAttribute('data-post-id');
            const content = e.currentTarget.comment.value;
            handleComment(postId, content, currentUser);
            e.currentTarget.comment.value = '';

        });
    });
}
