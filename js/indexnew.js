let loggedIn = JSON.parse(localStorage.getItem('authStatus'));
let activeUser = null;

const ITEM_ADD_TO_CART = 'itemAddedToCart';
const ITEM_DELETE_FROM_CART = 'itemDeletedFromCart';
const CLEAR_CART = 'clearCart';
const CHECKOUT = 'checkout';
const USER_UPDATED = 'userUpdated';
const USER_PHOTO_UPDATED = 'pictureUpdated';
const USER_LOGIN = 'userLogin';
const USER_LOGOUT = 'userLogout';
const USER_REGISTER = 'userRegister';

//#region Main function
//AUTHORS: Shuhan Han and Michael Boisvenu-Landry
$(function () {
    // localStorage.clear();
    searchInit();
    //loadSuccessStatuses();

    if (loggedIn === null) {
        loggedIn = false;
        localStorage.setItem('authStatus', JSON.stringify(loggedIn));
    } else {
        if (loggedIn) {
            activeUser = JSON.parse(localStorage.getItem('activeUser'));
        }
    }

    userAuthContextHandler(loggedIn);

    if (window.location.href.includes("index.html")) {
        play_carousel();
        featured_products();

        if (loadStatus(CHECKOUT)) {
            displayMessage('Thanks for your order!');
            setStatus(CHECKOUT, false);
        }

        if (loadStatus(USER_LOGOUT)) {
            displayMessage('Succesfully logged out.');
            setStatus(USER_LOGOUT, false);
        }

        if (loadStatus(USER_LOGIN)) {
            displayMessage(`Welcome back ${activeUser['username']}!`);
            setStatus(USER_LOGIN, false);
        }

        if (loadStatus(USER_REGISTER)) {
            displayMessage(`Welcome to sHopper ${activeUser['username']}!`);
            setStatus(USER_REGISTER, false);
        }
    }

    if (window.location.href.includes("?searchTerm")) {
        if (loadStatus(ITEM_ADD_TO_CART)) {
            displayMessage("Item added to cart succesfully");
            setStatus(ITEM_ADD_TO_CART, false);
        }
    }

    if (window.location.href.includes("product.html")) {
        loadProductInfo();

        if (loadStatus(ITEM_ADD_TO_CART)) {
            displayMessage("Item added to cart succesfully");
            setStatus(ITEM_ADD_TO_CART, false);
        }
    }

    if (window.location.href.includes('cart.html')) {
        if (!loggedIn) {
            window.location.href = './login.html'
        }
        else {
            // let updated_cart = JSON.parse(localStorage.getItem('updated_cart'));
            let updated_cart = localStorage.getItem('updated_cart');
            if (updated_cart !== null) {
                localStorage.setItem('cart', updated_cart);
                localStorage.removeItem('updated_cart');
                updateCartCount();
            }
        }

        loadCartData();

        if (loadStatus(ITEM_DELETE_FROM_CART)) {
            displayMessage("Item removed succesfully.");
            setStatus(ITEM_DELETE_FROM_CART, false);
        }

        if (loadStatus(CLEAR_CART)) {
            displayMessage('Cart succesfully cleared.');
            setStatus(CLEAR_CART, false);
        }
    }

    if (window.location.href.includes('all.html')) {
        document.getElementById('searchButton').href = '../products/results.html';

        if (loadStatus(ITEM_ADD_TO_CART)) {
            displayMessage('Item added to cart sucesfully.');
            setStatus(ITEM_ADD_TO_CART, false);
        }
        loadProducts('all');
    }

    if (window.location.href.includes('drinks.html')) {
        document.getElementById('searchButton').href = '../products/results.html';

        if (loadStatus(ITEM_ADD_TO_CART)) {
            displayMessage('Item added to cart sucesfully.');
            setStatus(ITEM_ADD_TO_CART, false);
        }
        loadProducts('drinks');
    }

    if (window.location.href.includes('cookies.html')) {
        document.getElementById('searchButton').href = '../products/results.html';

        if (loadStatus(ITEM_ADD_TO_CART)) {
            displayMessage('Item added to cart sucesfully.');
            setStatus(ITEM_ADD_TO_CART, false);
        }
        loadProducts('cookies');
    }

    if (window.location.href.includes('soups.html')) {
        document.getElementById('searchButton').href = '../products/results.html';

        if (loadStatus(ITEM_ADD_TO_CART)) {
            displayMessage('Item added to cart sucesfully.');
            setStatus(ITEM_ADD_TO_CART, false);
        }
        loadProducts('soups');
    }

    if (window.location.href.includes('login.html')) {
        if (loggedIn)
            window.location.href = './index.html';
        else {
            document.getElementById('username').addEventListener('blur', validate);
            document.getElementById('password').addEventListener('blur', validate);
        }
    }

    if (window.location.href.includes('signup.html')) {
        if (loggedIn)
            window.location.href = './index.html';
        else {
            document.getElementById('username').addEventListener('blur', validate);
            document.getElementById('email').addEventListener('blur', validate);
            document.getElementById('password').addEventListener('blur', validate);
            document.getElementById('confirm-password').addEventListener('blur', validate);
            document.getElementById('first-name').addEventListener('blur', validate);
            document.getElementById('last-name').addEventListener('blur', validate);
        }
    }

    if (window.location.href.includes('profile.html')) {
        if (!loggedIn) {
            window.location.href = './login.html';
        }

        loadUserProfile(activeUser);

        if (loadStatus(USER_UPDATED)) {
            displayMessage('Profile succesfully updated.');
            setStatus(USER_UPDATED, false);
        }


    }

    if (window.location.href.includes('results.html')) {
        document.getElementById('searchButton').href = '../products/results.html';
        searchProducts(getSearchTerm());
    }

});

//#endregion

//#region Search
//AUTHOR: David Currey
function searchInit() {
    // Get a reference to the form and input element
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchBar');

    // Add an event listener to the form's submit event
    searchButton.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent the form from actually submitting

        // Get the user's input
        const userInput = searchInput.value;

        // Redirect to results.html with searchTerm as a query parameter
        let url = `./products/results.html?searchTerm=${encodeURIComponent(userInput)}`;
        if (window.location.href.includes('/products')) {
            url = `./results.html?searchTerm=${encodeURIComponent(userInput)}`;
        }
        window.location.href = url;
    });
}

function getSearchTerm() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get('searchTerm') || '';
}

function searchProducts(keyword) {
    const categories = [drinks, cookies, soups];
    const matchingProducts = [];

    categories.forEach(category => {
        category['product'].forEach(product => {
            if (product['name'].toLowerCase().includes(keyword.toLowerCase())
                || product['description'].toLowerCase().includes(keyword.toLowerCase())) {
                matchingProducts.push({ ...product, 'category': category })
            }
        });
    });
    createProductCards(matchingProducts);
    document.getElementById('resultText').innerText = `Results for: "${keyword}"`;
    document.getElementById('resultCount').innerText = (matchingProducts.length != 1) ? `${matchingProducts.length} results...` : `1 result...`;
}

//#endregion

//#region User Profile
//AUTHORS: Nnamdi Echegini and Michael Boisvenu-Landry
function loadUserProfile(user) {
    const noneText = 'None'

    function fieldEmpty(property) {
        return (property === '' || property === noneText)
    }

    if (user === null)
        window.location.href = 'index.html';
    else {
        const allUsers = JSON.parse(localStorage.getItem('users'));
        document.getElementById('logoutButton').addEventListener('click', () => {
            loggedIn = false;
            localStorage.setItem('authStatus', JSON.stringify(loggedIn));
            setStatus(USER_LOGOUT, true);
            setStatus(USER_REGISTER, false);
            window.location.href = 'index.html';
        });

        const profilePicture = document.getElementById('profilePhoto');
        profilePicture.src = user['profilePicture'];
        profilePicture.alt = user['username'] + "'s Profile Picture";

        document.getElementById('userNameDisplay').innerText = user['username'];
        document.getElementById('emailDisplay').innerText = user['email'];

        document.getElementById('firstname').value = (!fieldEmpty(user['firstName'])) ? user['firstName'] : noneText;
        document.getElementById('lastname').value = (!fieldEmpty(user['lastName'])) ? user['lastName'] : noneText;
        document.getElementById('username').value = (!fieldEmpty(user['username'])) ? user['username'] : noneText;
        document.getElementById('email').value = (!fieldEmpty(user['email'])) ? user['email'] : noneText;
        document.getElementById('mobileNumber').value = (!fieldEmpty(user['phoneNumber'])) ? user['phoneNumber'] : noneText;
        document.getElementById('addressLine1').value = (!fieldEmpty(user['addressLine1'])) ? user['addressLine1'] : noneText;
        document.getElementById('addressLine2').value = (!fieldEmpty(user['addressLine2'])) ? user['addressLine2'] : noneText;
        document.getElementById('postalCode').value = (!fieldEmpty(user['postalCode'])) ? user['postalCode'] : noneText;
        document.getElementById('province').value = (!fieldEmpty(user['province'])) ? user['province'] : noneText;
        document.getElementById('city').value = (!fieldEmpty(user['city'])) ? user['city'] : noneText;

        document.getElementById('dpButton').addEventListener('click', () => {
            const uploadInput = document.createElement('input');
            uploadInput.type = 'file';
            uploadInput.accept = 'image/*';
            uploadInput.addEventListener('change', function (event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        profilePicture.src = e.target.result;
                    };
                    reader.readAsDataURL(file);


                }
            });

            uploadInput.click();

        });

        document.getElementById('submitProfileButton').addEventListener('click', (e) => {
            e.preventDefault();

            let firstName = '';
            let lastName = '';
            let userName = '';
            let email = '';
            let mobileNumber = '';
            let postalCode = '';
            let province = '';
            let city = '';

            function validateFirstName() {
                firstName = document.getElementById("firstname").value;
                if (firstName.trim() === "" || firstName === noneText) {
                    return "First Name is required.";
                }
                return "";
            }

            function validateLastName() {
                lastName = document.getElementById("lastname").value;
                if (lastName.trim() === "" || lastName === noneText) {
                    return "Last Name is required.";
                }
                return "";
            }

            function validateUserName() {
                userName = document.getElementById("username").value;
                if (userName.trim() === "" || userName === noneText) {
                    return "User Name is required.";
                }
                return "";
            }

            function validateEmail() {
                email = document.getElementById("email").value;

                if (email.trim() === "" || email === noneText) {
                    return "Email is required.";
                }

                function countSymbols(emailString, symbol) {
                    let count = 0;
                    for (let i = 0; i < emailString.length; i++)
                        if (emailString[i] === symbol)
                            count++;

                    return count;
                }

                const dotCount = countSymbols(email, '.');
                const atCount = countSymbols(email, '@');

                if (atCount !== 1 || dotCount !== 1)
                    return "Email is in an invalid format.";

                return "";
            }

            function validateMobileNumber() {
                mobileNumber = document.getElementById("mobileNumber").value;


                if (mobileNumber.length != 10) {
                    return "Phone number must be 10 digits.";
                }

                return "";
            }

            function validatePostalCode() {
                postalCode = document.getElementById("postalCode").value;
                if (postalCode.trim() === "") {
                    return "Postal Code is required.";
                }

                if (postalCode.trim().length !== 6) {
                    return "Postal code must be 6 characters."
                }

                return "";
            }

            function validateProvince() {
                province = document.getElementById("province").value;
                if (province.trim() === "" || province === noneText) {
                    return "Province is required.";
                }
                return "";
            }

            function validateCity() {
                city = document.getElementById("city").value;
                if (city.trim() === "" || city === noneText) {
                    return "City is required.";
                }
                return "";
            }

            function clearError(errorSpan) {
                if (errorSpan) {
                    errorSpan.textContent = "";
                }
            }

            // Validate First Name
            let firstNameErrorSpan = document.getElementById("firstNameError");
            let firstNameError = validateFirstName();
            clearError(firstNameErrorSpan);
            if (firstNameError !== "") {
                firstNameErrorSpan.textContent = firstNameError;
            }

            // Validate Last Name
            let lastNameErrorSpan = document.getElementById("lastNameError");
            let lastNameError = validateLastName();
            clearError(lastNameErrorSpan);
            if (lastNameError !== "") {
                lastNameErrorSpan.textContent = lastNameError;
            }

            // Validate User Name
            let userNameErrorSpan = document.getElementById("userNameError");
            let userNameError = validateUserName();
            clearError(userNameErrorSpan);
            if (userNameError !== "") {
                userNameErrorSpan.textContent = userNameError;
            }

            // Validate Email
            let emailErrorSpan = document.getElementById("emailError");
            let emailError = validateEmail();
            clearError(emailErrorSpan);
            if (emailError !== "") {
                emailErrorSpan.textContent = emailError;
            }


            // Validate Mobile Number
            let mobileNumberErrorSpan = document.getElementById("mobileNumberError");
            let mobileNumberError = validateMobileNumber();
            clearError(mobileNumberErrorSpan);
            if (mobileNumberError !== "") {
                mobileNumberErrorSpan.textContent = mobileNumberError;
            }

            // Validate Postal Code
            let postalCodeErrorSpan = document.getElementById("postalCodeError");
            let postalCodeError = validatePostalCode();
            clearError(postalCodeErrorSpan);
            if (postalCodeError !== "") {
                postalCodeErrorSpan.textContent = postalCodeError;
            }

            // Validate Province
            let provinceErrorSpan = document.getElementById("provinceError");
            let provinceError = validateProvince();
            clearError(provinceErrorSpan);
            if (provinceError !== "") {
                provinceErrorSpan.textContent = provinceError;
            }

            // Validate City
            let cityErrorSpan = document.getElementById("cityError");
            let cityError = validateCity();
            clearError(cityErrorSpan);
            if (cityError !== "") {
                cityErrorSpan.textContent = cityError;
            }

            // If no input errors.
            let no_err = firstNameError === '' && lastNameError === '' && userNameError === '' && emailError === '' && mobileNumberError === '' && postalCodeError === '' && provinceError === '' && cityError === '';
            if (no_err) {
                // Updates the user.
                user['firstName'] = firstName;
                user['lastName'] = lastName;
                user['username'] = userName;
                user['email'] = email;
                user['postalCode'] = postalCode;
                user['phoneNumber'] = mobileNumber;
                user['province'] = province;
                user['city'] = city;
                user['addressLine1'] = document.getElementById('addressLine1').value;
                user['addressLine2'] = document.getElementById('addressLine2').value;
                user['profilePicture'] = profilePicture.src;
                localStorage.setItem('activeUser', JSON.stringify(user));

                // Updates the user list.
                let has_user = false;
                allUsers.forEach((u, idx, users) => {
                    if (u.username === user.username) {
                        users[idx] = user;
                        has_user = true;
                        return;
                    }
                });
                if (!has_user) {
                    allUsers.push(user);
                }
                localStorage.setItem('users', JSON.stringify(allUsers));

                setStatus(USER_UPDATED, true);
                window.location.href = './profile.html';
            }
        });


    }
}

//#endregion

//#region User Form Validations
//AUTHOR: Maha Fouda
function registerValidate() {
    var usernameInput = document.getElementById('username');
    var emailInput = document.getElementById('email');
    var passwordInput = document.getElementById('password');
    var confirmPasswordInput = document.getElementById('confirm-password');
    var firstNameInput = document.getElementById('first-name');
    var lastNameInput = document.getElementById('last-name');

    var usernameError = document.getElementById('username-error');
    var emailError = document.getElementById('email-error');
    var passwordError = document.getElementById('password-error');
    var confirmPasswordError = document.getElementById('confirm-password-error');
    var firstNameError = document.getElementById('first-name-error');
    var lastNameError = document.getElementById('last-name-error');

    // Reset error messages
    usernameError.textContent = '';
    emailError.textContent = '';
    passwordError.textContent = '';
    confirmPasswordError.textContent = '';
    firstNameError.textContent = '';
    lastNameError.textContent = '';

    //Check if user exists
    const users = JSON.parse(localStorage.getItem('users'));
    if (users !== null) {
        users.forEach((u) => {
            if (u['username'].toLowerCase() === usernameInput.value.toLowerCase()) {
                usernameError.textContent = 'User with that username already exists.'
            }

            if (u['email'].toLowerCase() === emailInput.value.toLowerCase()) {
                emailError.textContent = 'Email is already being used';
            }
        });
    }
    // Validate username
    if (usernameInput.value.length < 4 || usernameInput.value.length > 20) {
        usernameError.textContent = 'Username must be between 4 and 20 characters.';
    }

    // Validate email
    if (!isValidEmail(emailInput.value)) {
        emailError.textContent = 'Invalid email address.';
    }

    // Validate password
    if (passwordInput.value.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters.';
    }

    // Validate confirm password
    if (passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordError.textContent = 'Passwords do not match.';
    }

    // Validate first name
    if (firstNameInput.value.trim() === '') {
        firstNameError.textContent = 'First name is required.';
    }

    // Validate last name
    if (lastNameInput.value.trim() === '') {
        lastNameError.textContent = 'Last name is required.';
    }

    // Check if there are any error messages
    if (
        usernameError.textContent !== '' ||
        emailError.textContent !== '' ||
        passwordError.textContent !== '' ||
        confirmPasswordError.textContent !== '' ||
        firstNameError.textContent !== '' ||
        lastNameError.textContent !== ''
    ) {
        // Validation failed, do not submit
        return false;
    }

    // Validation successful
    return true;
}

function isValidEmail(email) {
    // Basic email validation, you can enhance this based on your requirements
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function registerValidateAndSubmit() {
    // Validate form
    if (!registerValidate()) {
        // Validation failed, do not submit
        return;
    }

    const user = {
        "id": 0,
        "username": document.getElementById('username').value,
        "password": document.getElementById('password').value,
        "email": document.getElementById('email').value,
        "firstName": document.getElementById('first-name').value,
        "lastName": document.getElementById('last-name').value,
        "phoneNumber": '',
        "addressLine1": '',
        "addressLine2": '',
        "postalCode": '',
        "province": '',
        "city": '',
        "profilePicture": 'https://i.pinimg.com/736x/7f/43/03/7f4303ad3716465ed058ed44a6f64369.jpg',
        'cart': ''
    };

    let users = JSON.parse(localStorage.getItem('users'));
    if (users === null) {
        users = [];
    }
    user['id'] = users.length;
    users.push(user);
    loggedIn = true;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('activeUser', JSON.stringify(user));
    localStorage.setItem('authStatus', JSON.stringify(loggedIn));
    setStatus(USER_REGISTER, true);
    window.location.href = 'index.html'
}

function loginValidate() {
    var usernameInput = document.getElementById('username');
    var passwordInput = document.getElementById('password');

    var usernameError = document.getElementById('username-error');
    var passwordError = document.getElementById('password-error');

    // Reset error messages
    usernameError.textContent = '';
    passwordError.textContent = '';
    const users = JSON.parse(localStorage.getItem('users'));
    if (users !== null) {
        let tempUser = null;

        users.forEach((u) => {
            if (u['username'].toLowerCase() === usernameInput.value.toLowerCase())
                tempUser = u;
        });

        if (tempUser !== null) {
            if (tempUser['password'] === passwordInput.value) {
                localStorage.setItem('activeUser', JSON.stringify(tempUser));
            } else {
                passwordError.textContent = 'Password is incorrect.';
            }
        } else {
            usernameError.textContent = 'No user with that username exists.';
        }
    } else {
        usernameError.textContent = 'No user with that username exists.';
        return false;
    }

    // Validate username
    if (usernameInput.value.length < 4 || usernameInput.value.length > 20) {
        usernameError.textContent = 'Username must be between 4 and 20 characters.';
    }

    // Validate password
    if (passwordInput.value.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters.';
    }

    // Check if there are any error messages
    if (usernameError.textContent !== '' || passwordError.textContent !== '') {
        // Validation failed, do not navigate
        return false;
    }

    // Validation successful
    return true;
}

function loginValidateAndNavigate() {
    // Validate form
    if (!loginValidate()) {
        // Validation failed, do not navigate
        return;
    }
    loggedIn = true;
    localStorage.setItem('authStatus', loggedIn);
    setStatus(USER_LOGIN, true);
    // Validation successful, navigate to home.html
    window.location.href = 'index.html';
}

//#endregion

//#region Misc
//Author: Michael Boisvenu-Landry

function loadStatus(statusKey) {
    let value = JSON.parse(localStorage.getItem(statusKey));
    if (value === null) {
        setStatus(statusKey, false);
        return false;
    }

    console.log(`LOAD STATUS VALUE: ${value}`);
    return value;
}

function setStatus(statusKey, value) {
    localStorage.setItem(statusKey, JSON.stringify(value));
}

function displayMessage(message) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    const messageText = document.createElement('h1');
    messageText.classList.add('message-message');
    messageText.innerText = message;

    const closeButton = document.createElement('p');
    closeButton.classList.add('message-close');
    closeButton.innerText = 'X';

    messageContainer.appendChild(messageText);
    messageContainer.appendChild(closeButton);

    document.querySelector('body').appendChild(messageContainer);

    closeButton.addEventListener('click', () => {
        messageContainer.style.display = 'none';
    });
}

function userAuthContextHandler(loggedIn) {
    let contextButtons = document.querySelectorAll('.menu-button');
    contextButtons[0].style.display = (loggedIn) ? 'flex' : 'none'
    contextButtons[1].style.display = (loggedIn) ? 'flex' : 'none'
    contextButtons[2].style.display = (loggedIn) ? 'none' : 'flex'
    contextButtons[3].style.display = (loggedIn) ? 'none' : 'flex'

    if (loggedIn) {
        cartCount = localStorage.getItem('cartCount');
        if (cartCount === null) {
            console.log('cart count was null, initializing');
            cartCount = 0;
            localStorage.setItem('cartCount', JSON.stringify(cartCount));
        }
        document.getElementById('cartItemsCount').innerText = `${cartCount}`;
    }
}

// Author: Shuhan Han
function play_carousel() {
    let slideNum = 0;
    let slideCount = $(".slides li").length;
    let lastIndex = slideCount - 1;
    let interval;

    function carousel() {
        interval = setInterval(moveRight, "2000");
    };

    function show() {
        $(".dot li").eq(slideNum).css("background-color", "white")
            .siblings().css("background-color", "transparent");

        $("ul.slides").css("left", -800 * slideNum);
    }

    function moveRight() {
        slideNum++;
        if (slideNum > lastIndex)
            slideNum = 0;
        show();
    }

    $(".dot li").eq(0).css("background-color", "white");
    $(".dot li").mouseenter(function () {
        slideNum = $(this).index();
        show();
    });
    carousel();
    $("#prevSlide i").click(function () {
        slideNum--;
        if (slideNum < 0)
            slideNum = lastIndex;
        show();
    });
    $("#nextSlide i").click(function () {
        moveRight();
    });
    $(".wrapper").hover(function () {
        clearInterval(interval);
    }, function () {
        carousel();
    });
}

// End of Plays Carousel 
//#endregion

//#region Creates product cards on page 
//Author: Michael Boisvenu-Landry
function getCategory(product) {
    if (product['category_id'] === 1) return "drink";
    if (product['category_id'] === 2) return "cookie";
    if (product['category_id'] === 3) return "soup";
}

//Author: Shuhan Han with modifications by Michael Boisvenu-Landry
function featured_products() {
    function setCatTitleHomePage(num) {
        let prepend = `<h1 class="home-product-category-title">`;
        let append = `</h1>`;
        switch (num) {
            case 0:
                return $(prepend + "Under $20" + append);
            case 1:
                return $(prepend + "Highest Rated Products" + append);
            case 4:
                return $(prepend + "Newest Cookies" + append);
            case 2:
                return $(prepend + "Newest Drinks" + append);
            case 3:
                return $(prepend + "Newest Soups" + append);
            default:
                console.log("Default case hit in setCatTitleHomePage");
                break;
        }
    }

    let catIndex = 0;
    let allProducts = drinks['product'].concat(soups['product'], cookies['product']);
    let under20 = allProducts.filter(p => p['price'] < 20);
    let highestRated = allProducts.sort((a, b) => (b['rating_count'] / b['rating']) - (a['rating_count'] / a['rating']));
    let drinksByDate = allProducts.filter(p => p['category_id'] === 1).sort((a, b) => new Date(b['created_at']) - new Date(a['created_at']));
    let cookiesByDate = allProducts.filter(p => p['category_id'] === 2).sort((a, b) => new Date(b['created_at']) - new Date(a['created_at']));
    let soupsByDate = allProducts.filter(p => p['category_id'] === 3).sort((a, b) => new Date(b['created_at']) - new Date(a['created_at']));

    // Create number of products in a category
    function create_category_products(productList, num) {
        // Container
        let container = $('<div class="home-product-container">');
        // Title
        let title = setCatTitleHomePage(catIndex);
        catIndex++;
        // Product Cards
        for (i = 0; i < num; i++) {
            // Product
            let product = productList[i];
            // Card
            let card = $('<div class="home-product-card card-clickable">');
            // Image
            let img = $('<img class="home-product-img">').attr({
                src: `image/product/${getCategory(product)}/${product['photo']}`,
                alt: product['name'],

            });
            // card content
            let cardContent = $('<div class="home-product-card-content">');
            let cardTitle = $('<div class="home-product-name">').text(product['name']);
            let cardDescription = $('<div class="home-product-description">').text(product['description']);
            let cardPrice = $('<div class="home-product-price">');
            let cardOriginalPrice = $('<span>').text(`$${product['price']}`);
            // Discount
            if (product['discount'] > 0) {
                cardOriginalPrice.addClass('card-discount'); // Add strike-through
                const newPrice = (product['price'] * (1 - product['discount'])).toFixed(2);
                const percentageOff = ((product['discount']) * 100).toFixed(0);
                // Price after discount and percentage off
                let cardDiscountPrice = $('<span class="home-product-new-price">').text(` $${newPrice} `);
                let cardDiscountPercent = $('<span class="percentage-off">').text(` ${percentageOff}% OFF`);
                // Append elements to the card-price
                cardPrice.append(cardDiscountPrice);
                cardPrice.append(cardDiscountPercent);
            }

            let cardRating = `<div class="home-product-rating">${createStars(product['rating'])} <span class="product-rating-count">(${product['rating_count']})</span></div>`;
            // Append elements to the card-price
            cardPrice.prepend(cardOriginalPrice);
            // Append elements to the card-content
            cardContent.prepend(cardTitle, cardDescription, cardPrice, cardRating);
            // Append elements to the card
            card.append(img, cardContent);
            // Append the card to the container
            container.append(card);
            // Append the container to the body
            $('body').append(title, container);
        }
    }

    // Function to create stars based on the rating


    create_category_products(under20, 6);
    create_category_products(highestRated, 6);
    create_category_products(drinksByDate, 6);
    create_category_products(soupsByDate, 6);
    create_category_products(cookiesByDate, 6);

    let cards = document.querySelectorAll('.card-clickable');
    cards.forEach(c => c.addEventListener('click', () => {
        let name = c.querySelector('.home-product-name').innerHTML;
        let selectedProduct = allProducts.filter(p => p['name'] === name)[0];
        localStorage.setItem('selectedProduct', JSON.stringify(selectedProduct));
        console.log(localStorage.getItem('selectedProduct'))
        window.location.href = "product.html";
    }));

}

//Author: Shuhan Han
function createStars(rating) {
    const full_rating = 5;
    const emptyStars = full_rating - rating;
    const starIcon = '<span class="material-icons-sharp star-rating" style="font-size: 1rem;">star</span>'; // You can use any star icon you prefer
    const emptyStarIcon = '<span class="material-icons-sharp star-rating" style="font-size: 1rem;">star_border</span>'; // You can use any star icon you prefer

    let stars = starIcon.repeat(rating);
    if (emptyStars > 0) {
        stars += emptyStarIcon.repeat(emptyStars);
    }
    return stars;
}

//#endregion

//#region Handles product page
function loadProductInfo() {
    const storedProduct = JSON.parse(localStorage.getItem('selectedProduct'));
    let productImage = document.getElementById('productPageImage');
    let productName = document.getElementById('productPageName');
    let productPrice = document.getElementById('productPagePrice');
    let productRating = document.getElementById('productPageRating');
    let productCategory = document.getElementById('productPageCategory');
    let productDescription = document.getElementById('productPageDescription');
    let cartButton = document.getElementById('addToCartButton');

    productImage.src = `image/product/${getCategory(storedProduct)}/${storedProduct['photo']}`;
    productName.innerText = storedProduct['name'];
    console.log(storedProduct['price']);
    productPrice.innerText = '$' + storedProduct['price'];
    let cardRating = `<div class="home-product-rating">${createStars(storedProduct['rating'])} <span class="product-rating-count">(${storedProduct['rating_count']})</span></div>`;
    productRating.innerHTML = cardRating;
    let category = getCategory(storedProduct);
    category = category.charAt(0).toUpperCase() + category.slice(1);
    productCategory.innerText = category;
    productDescription.innerText = storedProduct['description'];
    cartButton.innerHTML = '<span class="material-icons-sharp">shopping_cart</span> ' + ((document.querySelectorAll('.menu-button')[0].style.display === 'flex') ? 'Add To Cart' : 'Login to Shop');
    if (loggedIn) {
        cartButton.addEventListener('click', function () {
            addToCart(storedProduct);
            window.location.href = "product.html";
        })
    } else {
        cartButton.addEventListener('click', function () {
            window.location.href = "login.html";
        })
    }
}

function addToCart(product) {
    // localStorage.clear();
    let cart = JSON.parse(localStorage.getItem('cart'));
    if (cart === null) {
        product.quantity++;
        cart = [product];
    } else {
        let product_exists = false; // 
        cart.forEach(p => {
            if (p.id === product.id) {
                p.quantity++;
                product_exists = true;
                return;
            }
        });
        if (!product_exists) {
            product.quantity++;
            cart.push(product);
        }
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    //
    updateCartCount();
    setStatus(ITEM_ADD_TO_CART, true);
    //successMessage();
}

//#endregion

//#region Nav Context Menu
//Author: Michael Boisvenu-Landry
let menuContext = null;
let contextActivator = null;
let menuOpen = false;
menuContext = document.getElementById('menuContext');
contextActivator = document.getElementById('menuContextActivator')
contextActivator.addEventListener('click', () => {
    menuOpen = !menuOpen;
    menuContext.style.display = menuOpen ? "none" : "block";

});
//#endregion

//#region Cart
//Author: Michael Boisvenu-Landry
function updateCartCount() {
    count = 0;
    const cart = JSON.parse(localStorage.getItem('cart'));
    if (cart !== null) {
        cart.forEach(product => {
            count += product.quantity;
        });
    }
    localStorage.setItem('cartCount', JSON.stringify(count));
    document.getElementById('cartItemsCount').innerText = `${count}`;
}

function loadCartData() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    const cartHtml = document.getElementById('cartBody');
    let total = 0;
    const productMap = new Map();
    if (cart !== null) {
        cartHtml.innerHTML = '';
        // cart.forEach(product => {
        //     if (product.quantity === null) {
        //         productMap.set(product['name'], product.qu);
        //     } else {
        //         productMap.set(product['name'], { ...product, quantity: 1 });
        //     }
        // });

        cart.forEach(product => {
            const row = document.createElement('tr');

            const nameCell = document.createElement('td');
            nameCell.classList.add('cart-item');
            const prodImage = document.createElement('img');
            const prodName = document.createElement('p');
            prodName.classList.add('cart-item-name');
            prodImage.width = 75;
            prodImage.height = 75;
            prodImage.src = `image/product/${getCategory(product)}/${product['photo']}`
            prodName.textContent = product['name'];
            nameCell.appendChild(prodImage);
            nameCell.appendChild(prodName);

            const quantityCell = document.createElement('td');
            const quantityDropdown = document.createElement('select');
            for (let i = 1; i < 19; i++) {
                const selectItem = document.createElement('option');
                selectItem.value = i;
                selectItem.text = i;
                quantityDropdown.appendChild(selectItem);
            }
            quantityDropdown.selectedIndex = product.quantity - 1;
            quantityDropdown.addEventListener('change', () => {
                product.quantity = quantityDropdown.selectedIndex + 1;
                console.log(product.quantity);
                // Update 
                let updated_cart = JSON.parse(localStorage.getItem('cart'));
                for (let i = 0; i < updated_cart.length; i++) {
                    if (updated_cart[i].id === product.id) {
                        updated_cart[i].quantity = product.quantity;
                    }
                }
                console.log(updated_cart);
                localStorage.setItem('updated_cart', JSON.stringify(cart));
                location.reload();
                // 
                // updateCartCount();
            })
            quantityCell.appendChild(quantityDropdown);


            const priceCell = document.createElement('td');
            const price = parseFloat(product['price']);
            // priceCell.textContent = '$' + (price * product.quantity).toFixed(2);
            priceCell.textContent = '$' + price.toFixed(2);

            const actionCell = document.createElement('td');
            const deleteButton = document.createElement('p');
            deleteButton.classList.add('button', 'box-shadow');
            deleteButton.textContent = 'Delete'
            actionCell.appendChild(deleteButton);

            row.appendChild(nameCell);
            row.appendChild(priceCell);
            row.appendChild(quantityCell);
            row.appendChild(actionCell);

            cartHtml.appendChild(row);

            // Add the total for this product to the overall total
            total += price * product.quantity;

            deleteButton.addEventListener('click', () => {
                // Get the product name associated with the delete button
                const productName = product['name'];

                // Find and remove all instances of the product from the cart array
                const updatedCart = cart.filter(item => item['name'] !== productName);

                // Update the localStorage with the modified cart data
                localStorage.setItem('cart', JSON.stringify(updatedCart));

                // Reload cart data and update the cart count in the UI
                setStatus(ITEM_DELETE_FROM_CART, true);
                window.location.href = './cart.html';
                updateCartCount();

            });

        });
    }

    // Display the total
    document.getElementById('cartTotal').textContent = '$' + total.toFixed(2);
    document.getElementById('clearCart').addEventListener('click', () => {
        localStorage.setItem('cart', JSON.stringify([]));
        setStatus(CLEAR_CART, true);
        window.location.href = './cart.html';
        updateCartCount();
    });

    document.getElementById('checkout').addEventListener('click', () => {
        localStorage.setItem('cart', JSON.stringify([]));
        setStatus(CHECKOUT, true);
        window.location.href = './index.html';
        updateCartCount();
    });


}

//#endregion

//#region Product Card
function createProductCards(products) {
    const categoryContainer = document.getElementById('productsContainer');
    products.forEach((product) => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card-shopping-container');

        const topDiv = document.createElement('div');
        topDiv.classList.add('product-card-shopping-top');

        const bottomDiv = document.createElement('div');
        bottomDiv.classList.add('product-card-shopping-bottom');

        const cardImage = document.createElement('img');
        cardImage.classList.add('product-card-shopping-img');
        cardImage.src = `../image/product/${getCategory(product)}/${product['photo']}`;

        const cardTitle = document.createElement('h1');
        cardTitle.innerText = product['name'];

        const cardDescription = document.createElement('p');
        cardDescription.innerText = product['description'];

        const cardPriceContainer = document.createElement('div');
        cardPriceContainer.classList.add('product-card-price-container')
        const cardPrice = document.createElement('h2');

        const priceSpan = document.createElement('span');
        priceSpan.classList.add('product-card-price');
        priceSpan.innerText = product['price'];
        cardPrice.innerHTML = "Price: $";
        cardPrice.appendChild(priceSpan);

        cardPriceContainer.appendChild(cardPrice);

        //fix
        if (product['discount'] > 0) {
            priceSpan.classList.add('card-discount');

            const newPrice = document.createElement('span');
            const percentOff = document.createElement('span');

            newPrice.classList.add('home-product-new-price', 'bolder');
            percentOff.classList.add('percentage-off');

            newPrice.innerText = (product['price'] * (1 - product['discount'])).toFixed(2);
            percentOff.innerText = ((product['discount']) * 100).toFixed(0) + "% OFF";

            cardPriceContainer.appendChild(newPrice);
            cardPriceContainer.appendChild(percentOff);

        }


        const cardRating = document.createElement('div');
        cardRating.classList.add('home-product-rating');

        cardRating.innerHTML = `${createStars(product['rating'])} <span class="product-rating-count">(${product['rating_count']})</span>`;

        const cardButtons = document.createElement('div');
        cardButtons.classList.add('card-button-container');
        const moreInfoButton = document.createElement('p');
        moreInfoButton.classList.add('button', 'more-info-button');
        moreInfoButton.innerText = "View Product";
        moreInfoButton.addEventListener('click', function () {
            localStorage.setItem('selectedProduct', JSON.stringify(product));
            window.location.href = "../product.html";
        });

        cardButtons.appendChild(moreInfoButton);

        if (loggedIn) {
            const addToCartButton = document.createElement('p');
            addToCartButton.classList.add('button');
            addToCartButton.innerHTML = `<span class="material-icons-sharp">shopping_cart</span> +`;
            addToCartButton.addEventListener('click', function () {
                addToCart(product);
                updateCartCount();
                console.log('added');
                location.reload();
                // window.location.href = `${getCategory(product)}s.html`;
            });

            cardButtons.appendChild(addToCartButton);
        }

        topDiv.appendChild(cardImage);
        topDiv.appendChild(cardTitle);
        topDiv.appendChild(cardDescription);

        bottomDiv.appendChild(cardPriceContainer);
        bottomDiv.appendChild(cardRating);
        bottomDiv.appendChild(cardButtons);

        productCard.appendChild(topDiv);
        productCard.appendChild(bottomDiv);

        categoryContainer.appendChild(productCard);
    });
}

//Author: Michael Boisvenu-Landry
function loadProducts(productCategory) {

    switch (productCategory.toLowerCase()) {
        case 'all':
            const allProducts = drinks['product'].concat(soups['product'], cookies['product']);
            createProductCards(allProducts);
            break;
        case 'drinks':
            createProductCards(drinks['product']);
            break;
        case 'soups':
            createProductCards(soups['product']);
            break;
        case 'cookies':
            createProductCards(cookies['product']);
            break;


    }
}

//#endregion

//#region Dummy Data
//Author: Shuhan Han

const drinks = {
    "name": "drinks",
    "image-folder": "drink",
    "product": [
        {
            "id": "9a8cff74-e01c-43ab-a07f-69bda03d67cc",
            "name": "Monster Energy Punch, Aussie Style Lemonade",
            "description": "473mL Cans, Pack of 12",
            "quantity": 0, "price": "23.31",
            "discount": 0.15,
            "rating": 5,
            "rating_count": 42,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "XANMvU0SYfflMmIVEIv1RNscYAYYRDcMRtrmhlAV.webp",
            "category_id": 1,
            "created_at": "2023-11-06 20:48:39",
            "updated_at": "2023-11-06 20:48:39"
        },
        {
            "id": "9a8cffc6-70bf-468d-a958-75a656801fdd",
            "name": "Reign Energy, Orange Dreamsicle",
            "description": "473mL Cans, Pack of 12",
            "quantity": 0, "price": "28.99",
            "discount": 0,
            "rating": 5,
            "rating_count": 165,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "drOmlLy6IAvWXCnItkPDivfGOp7CDF1bVPeIUaRB.webp",
            "category_id": 1,
            "created_at": "2023-11-06 20:49:32",
            "updated_at": "2023-11-06 20:49:32"
        },
        {
            "id": "9a8d001a-6c33-4293-b9f8-8a42c79870de",
            "name": "Monster Energy Java, 300 French Vanilla",
            "description": "444mL Cans, Pack of 12",
            "quantity": 0, "price": "23.49",
            "discount": 0.25,
            "rating": 4,
            "rating_count": 283,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "2upGNRVUKpUn3CYsKaTuVdnb4KKeaupAsdX6vW0L.webp",
            "category_id": 1,
            "created_at": "2023-11-06 20:50:27",
            "updated_at": "2023-11-06 20:50:27"
        },
        {
            "id": "9a8d006d-a85f-4f25-818a-d3c4129004a4",
            "name": "Monster Energy, Ultra Peachy Keen",
            "description": "473mL Cans, Pack of 12",
            "quantity": 0, "price": "23.49",
            "discount": 0,
            "rating": 5,
            "rating_count": 128,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "KNbhTpyQnrmXKuLLVoK3H7H73OkJgR3BTaXQZM5Y.webp",
            "category_id": 1,
            "created_at": "2023-11-06 20:51:22",
            "updated_at": "2023-11-06 20:51:22"
        },
        {
            "id": "9a8d00e3-5f03-4c9d-94b2-731c98ee4ea6",
            "name": "Country Time Lemonade Liquid Drink Mix",
            "description": "48ml",
            "quantity": 0, "price": "2.99",
            "discount": 0.50,
            "rating": 4,
            "rating_count": 1463,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "D1t54qUJuZtZLnDbt0pZhcN4LjVbXcK3dhiG38pe.webp",
            "category_id": 1,
            "created_at": "2023-11-06 20:52:39",
            "updated_at": "2023-11-06 20:52:39"
        },
        {
            "id": "9a8d0135-5daf-4166-8437-c81137e835ac",
            "name": "Rockstar Energy Drink Punched",
            "description": "Rockstar Energy Drink Punched",
            "quantity": 0, "price": "24.99",
            "discount": 0,
            "rating": 5,
            "rating_count": 424,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "pW58z4oZg4sJYcllAVq9MLFXZSVBSu5e66HJu5JR.webp",
            "category_id": 1,
            "created_at": "2023-11-06 20:53:33",
            "updated_at": "2023-11-06 20:53:33"
        },
        {
            "id": "9a8d0179-3973-4e5f-bd24-980edf8b0d8a",
            "name": "Bai Antioxidant Infusion Flavoured Water Beverage",
            "description": "Costa Rica Clementine, 530 mL, 12-Count",
            "quantity": 0, "price": "28.49",
            "discount": 0,
            "rating": 4,
            "rating_count": 666,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "O9zzSUgohVChkKyvbVNMJAXJF1ZhGihOKVg1YArQ.webp",
            "category_id": 1,
            "created_at": "2023-11-06 20:54:17",
            "updated_at": "2023-11-06 20:54:17"
        },
        {
            "id": "9a8d01de-f9b8-4291-a58c-80969458e393",
            "name": "Starbucks Double Shot Vanilla",
            "description": "444 mL Cans, 12 Pack",
            "quantity": 0, "price": "39.36",
            "discount": 0,
            "rating": 4,
            "rating_count": 780,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "nzslpEUemLgaXzMp7H3t2H4HFTJbrS3jwY6StrWR.webp",
            "category_id": 1,
            "created_at": "2023-11-06 20:55:24",
            "updated_at": "2023-11-06 20:55:24"
        },
        {
            "id": "9a8d0287-187f-4a50-ae43-00eea6dcd67a",
            "name": "Red Bull Energy Drink, Sugar Fre",
            "description": "473ml (12 pack)",
            "quantity": 0, "price": "43.59",
            "discount": 0,
            "rating": 4,
            "rating_count": 2956,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "XKiczk7LwBn7kN5gdW0DTcyPllY0d3OSoUdOE8A2.jpg",
            "category_id": 1,
            "created_at": "2023-11-06 20:57:14",
            "updated_at": "2023-11-06 20:57:14"
        },
        {
            "id": "9a8d02a3-1610-43e7-aeac-60d11641ec2c",
            "name": "Red Bull Energy Drink, Zero",
            "description": "473ml (12 pack)",
            "quantity": 0, "price": "63.48",
            "discount": 0,
            "rating": 4,
            "rating_count": 2956,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "gxBUOYhRwl4eyoTq8feUypVeNKH8Veh7azEr4icQ.jpg",
            "category_id": 1,
            "created_at": "2023-11-06 20:57:33",
            "updated_at": "2023-11-06 20:57:33"
        },
        {
            "id": "9a8d02d3-3c80-4b44-9b72-c617ee318a60",
            "name": "GURU Organic Energy Drink - New Theanine Fruit Punch",
            "description": "Power Up your Mind - Healthy Energy - Plant Based ingredients - Low Sugar - Only 50 calories - The ultimate Brain Booster - 355 ml (Pack of 24)",
            "quantity": 0, "price": "66.95",
            "discount": 0,
            "rating": 5,
            "rating_count": 96,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "TSLB2A1Wv65ncLUJlS1hv7jheorlwm3ejbrptBRU.webp",
            "category_id": 1,
            "created_at": "2023-11-06 20:58:04",
            "updated_at": "2023-11-06 20:58:04"
        },
        {
            "id": "9a8d030b-3e0f-42b9-9240-7b8d62f6f2b8",
            "name": "Juvee Rejuvenating Energy Drink. Kiwi Strawberry.",
            "description": "Sugar Free Energy Drinks. Taurine, Vitamin B12, Vitamin B6. 128 Mg Of Caffeine. L-Theanine For Mood Support. Panax Ginseng For Focus. Vitamin C For Immune Support. Gluten Free 12 fl oz (Pack of 12)",
            "quantity": 0, "price": "37.99",
            "discount": 0,
            "rating": 4,
            "rating_count": 64,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "obRQ5zokK2ACSAYpYJRVc77k3CDpRDq1X946UFbP.webp",
            "category_id": 1,
            "created_at": "2023-11-06 20:58:41",
            "updated_at": "2023-11-06 20:58:41"
        },
        {
            "id": "9a8d0402-5a1a-46dc-86f9-0fb26af3a7c7",
            "name": "Monster Energy Rehab, Peach Tea",
            "description": "458mL Cans, Pack of 12",
            "quantity": 0, "price": "28.99",
            "discount": 0,
            "rating": 5,
            "rating_count": 169,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "dQyM7OEgrdBlVdyH59bfvuug0eqv5XCHFEMkVKyv.webp",
            "category_id": 1,
            "created_at": "2023-11-06 21:01:23",
            "updated_at": "2023-11-06 21:01:23"
        },
        {
            "id": "9a8d0447-5ad6-4a5a-acdf-f18ec4837db8",
            "name": "Monster Energy Rehab, Tea + Lemonade",
            "description": "458mL Cans, Pack of 12",
            "quantity": 0, "price": "28.99",
            "discount": 0,
            "rating": 5,
            "rating_count": 113,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "fURJ6nZh7dHyPl9JzNlc6hFcgcydFC6rHX9LXiTB.webp",
            "category_id": 1,
            "created_at": "2023-11-06 21:02:08",
            "updated_at": "2023-11-06 21:02:08"
        },
        {
            "id": "9a8d04b2-f278-42fe-af96-22326d91df34",
            "name": "Monster Energy Rehab, Ultra Blue",
            "description": "458mL Cans, Pack of 12",
            "quantity": 0, "price": "23.49",
            "discount": 0,
            "rating": 4,
            "rating_count": 804,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "hpj4ZQwjkGFsmVjaFcVwLoDOR2hgFNhlKA9h6RRM.webp",
            "category_id": 1,
            "created_at": "2023-11-06 21:03:19",
            "updated_at": "2023-11-06 21:03:19"
        },
        {
            "id": "9a8d0627-a546-400f-b22a-03c739a556ff",
            "name": "Monster Energy, Zero Ultra",
            "description": "458mL Cans, Pack of 12",
            "quantity": 0, "price": "23.31",
            "discount": 0,
            "rating": 5,
            "rating_count": 804,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "rXSa6Kfzyq9kWst8bjYMCGU4GGKN0mQsRE5WMbwu.webp",
            "category_id": 1,
            "created_at": "2023-11-06 21:07:23",
            "updated_at": "2023-11-06 21:07:23"
        },
        {
            "id": "9a8d068b-2ea9-43f1-8a4d-155e94bbe21b",
            "name": "Monster Energy, Ultra Gold",
            "description": "473mL Cans, Pack of 12",
            "quantity": 0, "price": "23.49",
            "discount": 0,
            "rating": 5,
            "rating_count": 188,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "1uDWMSVHWomx2sgj9aCiqkC5pDuSsskGwfRQI4BR.webp",
            "category_id": 1,
            "created_at": "2023-11-06 21:08:28",
            "updated_at": "2023-11-06 21:08:28"
        },
        {
            "id": "9a8ca249-d251-4915-89c6-3121964698e9",
            "name": "CHI FOREST Sparkling Water White Peach Flavor",
            "description": "0 sugar, 0 calories, 100% flavor, 11.15 fl oz Cans(pack of 24)\u2026",
            "quantity": 0, "price": "25.49",
            "discount": 0,
            "rating": 4,
            "rating_count": 736,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "TzMWoD0lGAVbMhVcg4uDd0K3MbqEMgujob11M25F.webp",
            "category_id": 1,
            "created_at": "2023-11-06 16:28:08",
            "updated_at": "2023-11-06 16:28:08"
        },
        {
            "id": "9a8ca4ad-0c27-40b3-95e7-f1690c6eddc3",
            "name": "Pepsi cola",
            "description": "355 ml (Pack of 12)",
            "quantity": 0, "price": "6.97",
            "discount": 0,
            "rating": 4,
            "rating_count": 27,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "8BK0L27tgxsdzJVTW5w7DsUfMY7LbdBAlYBIIOnM.webp",
            "category_id": 1,
            "created_at": "2023-11-06 16:34:49",
            "updated_at": "2023-11-06 16:34:49"
        },
        {
            "id": "9a8ca519-5e3a-4e16-9982-34e7b606f49b",
            "name": "Snapple Naturally Flavoured Fruit Beverage Kiwi- Strawberry",
            "description": "473mL, 12-Count",
            "quantity": 0, "price": "11.99",
            "discount": 0,
            "rating": 4,
            "rating_count": 302,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "36Hmo6THXUFK2BUUaTb4UY46r2TUuqejYoMtO9vc.webp",
            "category_id": 1,
            "created_at": "2023-11-06 16:36:00",
            "updated_at": "2023-11-06 16:36:00"
        },
        {
            "id": "9a8ca5ab-8395-4ca8-bc89-bd6ffbe20c13",
            "name": "7UP Soft Drink",
            "description": "355 mL/12 fl. oz., Cans, 12 Pack",
            "quantity": 0, "price": "6.97",
            "discount": 0,
            "rating": 4,
            "rating_count": 944,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "ol4WT55D5iEHtjQJfEf9Bpg5jPfM9gnqj2TTbn4Y.webp",
            "category_id": 1,
            "created_at": "2023-11-06 16:37:35",
            "updated_at": "2023-11-06 16:37:35"
        },
        {
            "id": "9a8ca8fd-bdea-43e9-a7f8-31caad170c0b",
            "name": "Gatorade Orange Sports Drink",
            "description": "355mL, 12 Pack",
            "quantity": 0, "price": "27.88",
            "discount": 0,
            "rating": 5,
            "rating_count": 510,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "NtJPkh1BRvot23QBcdVjN9u8wyfAc1qjN1DVqa6f.webp",
            "category_id": 1,
            "created_at": "2023-11-06 16:46:53",
            "updated_at": "2023-11-06 16:46:53"
        },
        {
            "id": "9a8ca950-0281-4632-87b8-f51739675446",
            "name": "Gatorade Frost Glacier Freeze Sports Drink",
            "description": "591 mL Bottles, 4 x 6 Pack",
            "quantity": 0, "price": "27.96",
            "discount": 0,
            "rating": 5,
            "rating_count": 180,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "wd6nAgaY4bZ3fRzihuFW3yVfNzxlLyBNS343CYei.webp",
            "category_id": 1,
            "created_at": "2023-11-06 16:47:46",
            "updated_at": "2023-11-06 16:47:46"
        },
        {
            "id": "9a8caa4c-b618-41e7-908d-991ab70afca6",
            "name": "Coca-Cola Coke Classic",
            "description": "355mL Cans, Pack of 12",
            "quantity": 0, "price": "6.49",
            "discount": 0,
            "rating": 5,
            "rating_count": 791,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "oJZc4OUx8o7gTBopQ4sjb4A3ynrvj8vqfYUZ4gIv.webp",
            "category_id": 1,
            "created_at": "2023-11-06 16:50:32",
            "updated_at": "2023-11-06 16:50:32"
        },
        {
            "id": "9a8caac4-acf2-4b2a-8b80-4f3ce3109e2d",
            "name": "Dr Pepper",
            "description": "355 mL Cans, 12 Pack (Packaging May Vary)",
            "quantity": 0, "price": "6.79",
            "discount": 0,
            "rating": 5,
            "rating_count": 848,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "IyFRv5qeNzMNvIRMzz5dvYatJOV0HWXh6QdJflzW.webp",
            "category_id": 1,
            "created_at": "2023-11-06 16:51:51",
            "updated_at": "2023-11-06 16:51:51"
        },
        {
            "id": "9a8cab6a-99d7-43b7-8175-31e6ce73465f",
            "name": "Crystal Light On the Go, 60 Ct.",
            "description": "Variety Pack (Lemonade, Fruit Punch, Raspberry Lemonade, Wild Strawberry) 178g",
            "quantity": 0, "price": "24.0",
            "discount": 0,
            "rating": 5,
            "rating_count": 1723,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "Qh1X9HXcy3ofdkwZIzuxGkWyrw4rEwaExVe2Dkg2.webp",
            "category_id": 1,
            "created_at": "2023-11-06 16:53:39",
            "updated_at": "2023-11-06 16:53:39"
        },
        {
            "id": "9a8ce525-e2c3-45ef-9a6d-b685115c71aa",
            "name": "Lipton Lemon Iced Tea",
            "description": "340 ml Cans, 12 Pack",
            "quantity": 0, "price": "6.99",
            "discount": 0,
            "rating": 5,
            "rating_count": 572,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "q7oAiEWVwJwSYA0gual11SHrQxLwxiZa8omu8iFg.webp",
            "category_id": 1,
            "created_at": "2023-11-06 19:35:05",
            "updated_at": "2023-11-06 19:35:05"
        }
    ]
}

// End of Drinks

// Cookies

const cookies = {
    "name": "cookies",
    "image-folder": "cookie",
    "product": [
        {
            "id": "9a8ce61d-99af-4f5f-b5b3-4fed0f3cd5e4",
            "name": "Lotus Biscoff Cookies \u2013 Caramelized Biscuit Cookies",
            "description": "300 Cookies Individually Wrapped \u2013 Vegan,0.2 Ounce (Pack of 300)",
            "quantity": 0, "price": "31.99",
            "discount": 0,
            "rating": 5,
            "rating_count": 18897,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "Yqro8DlQRItqgmPQfW59fXDKeC5HmOtoXEkeC7h8.webp",
            "category_id": 2,
            "created_at": "2023-11-06 19:37:47",
            "updated_at": "2023-11-06 19:37:47"
        },
        {
            "id": "9a8ce974-9cfb-4b5d-a174-08afc2cdfda0",
            "name": "Lady Sarah Assorted Biscuits Family Pack",
            "description": "Chocolate Cream Cookies & Custard Cream Cookies 400G - Individual Packs",
            "quantity": 0, "price": "2.99",
            "discount": 0.23,
            "rating": 4,
            "rating_count": 421,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "q4qyzvLM36dsnTnGS2I8z5FYQi9usKptBlMGwetC.webp",
            "category_id": 2,
            "created_at": "2023-11-06 19:47:08",
            "updated_at": "2023-11-06 19:47:08"
        },
        {
            "id": "9a8ceb3a-edce-4a24-9e38-5cac6cb71edd",
            "name": "OREO Original Chocolate Sandwich Cookies",
            "description": "School Snacks, Family Size, 439g (Pack of 1)",
            "quantity": 0, "price": "3.79",
            "discount": 0,
            "rating": 5,
            "rating_count": 942,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "2XzJ8a1Z6xsROOqJk63q8pcDQl8HzyOVguuDWBa2.webp",
            "category_id": 2,
            "created_at": "2023-11-06 19:52:06",
            "updated_at": "2023-11-06 19:52:06"
        },
        {
            "id": "9a8ceb75-e914-424e-acf9-a244c1765938",
            "name": "Peek Freans Shortcake Biscuits/Cookies",
            "description": "350 Grams/10.6 Ounces",
            "quantity": 0, "price": "3.78",
            "discount": 0.39,
            "rating": 5,
            "rating_count": 1116,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "WXVTC8LnI1zsF8AZ1zEe1MfaQgm0xcLQdDqyvwr0.webp",
            "category_id": 2,
            "created_at": "2023-11-06 19:52:44",
            "updated_at": "2023-11-06 19:52:44"
        },
        {
            "id": "9a8cebc3-0fbb-48f5-8856-b7fa9e96b690",
            "name": "Nature's Garden Healthy Trail Mix Snack Packs",
            "description": "Mixed Nuts, Heart Healthy Nuts, Omega-3 Rich, Cranberries, Pumpkin Seeds, Perfect For The Entire Family \u2013 816g Bag (24 Individual Servings)",
            "quantity": 0, "price": "30.49",
            "discount": 0,
            "rating": 5,
            "rating_count": 10280,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "WH0ud1qRUGDFnuEVovUFDjLmZVaWmeRspahyxluJ.webp",
            "category_id": 2,
            "created_at": "2023-11-06 19:53:35",
            "updated_at": "2023-11-06 19:53:35"
        },
        {
            "id": "9a8cec1e-578a-413e-90a6-ea4a271f1eb4",
            "name": "Oreo Golden Sandwich Cookies",
            "description": "270g",
            "quantity": 0, "price": "5.99",
            "discount": 0.87,
            "rating": 5,
            "rating_count": 618,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "LAJWPoz4vqI2fV0NXTttzZPcJ9IQHZaVxz7hVWqY.webp",
            "category_id": 2,
            "created_at": "2023-11-06 19:54:35",
            "updated_at": "2023-11-06 19:54:35"
        },
        {
            "id": "9a8cec73-4f82-4ccf-9c08-bcf21ae4433a",
            "name": "Oreo Chocolate Peanut Butter Pie Cookies",
            "description": "Family Size 482g",
            "quantity": 0, "price": "4.79",
            "discount": 0,
            "rating": 5,
            "rating_count": 3131,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "gEh3h7nj9egWFoNKPHn2VQKzE1diSFKjXYifEnlq.webp",
            "category_id": 2,
            "created_at": "2023-11-06 19:55:30",
            "updated_at": "2023-11-06 19:55:30"
        },
        {
            "id": "9a8cecd9-2b1a-464e-89a6-658fb3b4ecb5",
            "name": "Royal Dansk - Danish Butter Cookies",
            "description": "340g",
            "quantity": 0, "price": "11.99",
            "discount": 0,
            "rating": 4,
            "rating_count": 38378,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "jIwNNHJdZiY1XzMhyYiZ9rOAl1ZAiYiAoA627Oqr.webp",
            "category_id": 2,
            "created_at": "2023-11-06 19:56:37",
            "updated_at": "2023-11-06 19:56:37"
        },
        {
            "id": "9a8ced2e-d7b3-4e3d-9691-ad9624c28814",
            "name": "Lady Sarah Individually Wrapped Nice Sugar Sprinkled Coconut Cookies",
            "description": "400G",
            "quantity": 0, "price": "2.69",
            "discount": 0,
            "rating": 4,
            "rating_count": 112,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "lFpVO9kKoV6vyYC7UBrxjV2rOUji6yjBNXbbiwsd.webp",
            "category_id": 2,
            "created_at": "2023-11-06 19:57:33",
            "updated_at": "2023-11-06 19:57:33"
        },
        {
            "id": "9a8cedaa-9bf1-4c2a-9373-75375c9c9251",
            "name": "Lady Sarah Sandwich Cookies",
            "description": "Vanilla Cream Cookies Snacks 300g",
            "quantity": 0, "price": "2.19",
            "discount": 0,
            "rating": 4,
            "rating_count": 401,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "1OffsVylBWyaSCcePDcR7M3XpZ9P7b6CDuE6DAQ5.webp",
            "category_id": 2,
            "created_at": "2023-11-06 19:58:54",
            "updated_at": "2023-11-06 19:58:54"
        },
        {
            "id": "9a8cee29-90e7-4963-a91e-0bcd332a242e",
            "name": "OREO & Chips Ahoy! & Teddy Graham Mini Cookie Ultimate School Snack Variety",
            "description": "6-Pack, 1.35kg",
            "quantity": 0, "price": "19.99",
            "discount": 0,
            "rating": 5,
            "rating_count": 493,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "HxI6wDtZb99SuVJ63pzvOaualLpLzCsEyy4gORZD.webp",
            "category_id": 2,
            "created_at": "2023-11-06 20:00:18",
            "updated_at": "2023-11-06 20:00:18"
        },
        {
            "id": "9a8cee62-9c64-45ac-8790-8479134790af",
            "name": "ShaSha Pumpkin Spice Snap Cookies",
            "description": "250 Gram",
            "quantity": 0, "price": "4.99",
            "discount": 0,
            "rating": 3,
            "rating_count": 107,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "9JouKOgGbkV8JLPmxkckMCBsgqmf25tgnZ2t5FKL.webp",
            "category_id": 2,
            "created_at": "2023-11-06 20:00:55",
            "updated_at": "2023-11-06 20:00:55"
        },
        {
            "id": "9a8ceec3-e81c-4a17-9288-ce8141cc6c44",
            "name": "VACHON 1/2 Lune Moon Vanilla Flavour Cakes with Creamy Filling",
            "description": "Contains 6 Cakes, Individually Wrapped, 282 Gram",
            "quantity": 0, "price": "3.0",
            "discount": 0,
            "rating": 5,
            "rating_count": 592,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "nJjFMPXqmGkIC6eDCNgzyAHKig8tuPoCAghyjR1G.webp",
            "category_id": 2,
            "created_at": "2023-11-06 20:01:59",
            "updated_at": "2023-11-06 20:01:59"
        },
        {
            "id": "9a8cef23-223a-4997-ac8d-56beb13ccd16",
            "name": "Lady Sarah Social Tea Biscuits",
            "description": "Individually Wrapped Tea Cookies 400G - Family Pack",
            "quantity": 0, "price": "2.99",
            "discount": 0,
            "rating": 4,
            "rating_count": 817,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "y84HRaTsLuREMOHpI9JW69ByOiB3KzMVLH8eePQy.webp",
            "category_id": 2,
            "created_at": "2023-11-06 20:03:01",
            "updated_at": "2023-11-06 20:03:01"
        },
        {
            "id": "9a8cef58-75c7-4026-bd3b-40fe2cbc60fd",
            "name": "Loacker Premium Italian Milk Wafers",
            "description": "45g/1.59oz, Milk, 540 Grams",
            "quantity": 0, "price": "18.99",
            "discount": 0,
            "rating": 4,
            "rating_count": 5,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "cTTQu8QJgXGQGoC2nmqVW0Ww7WsTB1K7BpMl5s6e.webp",
            "category_id": 2,
            "created_at": "2023-11-06 20:03:36",
            "updated_at": "2023-11-06 20:03:36"
        },
        {
            "id": "9a8cefaa-e82b-4876-8fbf-2df39326ab81",
            "name": "Kirkland Signature European cookies",
            "description": "49.4 oz (3.09 LBS)",
            "quantity": 0, "price": "40.91",
            "discount": 0,
            "rating": 4,
            "rating_count": 262,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "35lfVdK7diISdwj1jKzvFCGJTrYWU2CtdZJfipCd.jpg",
            "category_id": 2,
            "created_at": "2023-11-06 20:04:30",
            "updated_at": "2023-11-06 20:04:30"
        },
        {
            "id": "9a8cfad5-46b0-48b6-bb25-1d0ca70504bb",
            "name": "Kellogg's\u00ae Rice Krispies Squares\u00ae Homestyle Original Bars",
            "description": "198 g, 6 Bars",
            "quantity": 0, "price": "2.97",
            "discount": 0,
            "rating": 5,
            "rating_count": 53,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "r9p6LF494Feg0cXKDWBVqjtXiimpNLwwbeNVDKmd.jpg",
            "category_id": 2,
            "created_at": "2023-11-06 20:35:43",
            "updated_at": "2023-11-06 20:35:43"
        },
        {
            "id": "9a8cfb15-acf8-4d65-b4ba-babc67689ada",
            "name": "Betty Crocker Chocolate Chip Cookie",
            "description": "496 Gram",
            "quantity": 0, "price": "3.97",
            "discount": 0,
            "rating": 5,
            "rating_count": 909,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "MCyZIJ8zzo9FTvsEHNyvM2uTDYkyfeX7rzshA1zZ.jpg",
            "category_id": 2,
            "created_at": "2023-11-06 20:36:26",
            "updated_at": "2023-11-06 20:36:26"
        },
        {
            "id": "9a8cfb65-f43d-436e-800f-e63b9e1d881a",
            "name": "Loacker Quadratini Premium Italian Hazelnut Wafer Cookies",
            "description": "250g/8.82oz, Hazelnut, 250 Grams",
            "quantity": 0, "price": "7.06",
            "discount": 0,
            "rating": 4,
            "rating_count": 2948,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "9mAuA4M4jBTL6IdglVUTwU4LNadI6i599j6o49Ia.jpg",
            "category_id": 2,
            "created_at": "2023-11-06 20:37:18",
            "updated_at": "2023-11-06 20:37:18"
        },
        {
            "id": "9a8cfbc3-edad-4301-885c-7e1aa8c1c145",
            "name": "Oreo Double Stuf Gluten Free Sandwich Cookies Chocolate",
            "description": "353G, (Pack of 1)",
            "quantity": 0, "price": "7.99",
            "discount": 0,
            "rating": 4,
            "rating_count": 1941,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "qStqtBvhOVRDxyPLzXCgCT5h57sTbVtPeEKQWEFh.jpg",
            "category_id": 2,
            "created_at": "2023-11-06 20:38:20",
            "updated_at": "2023-11-06 20:38:20"
        },
        {
            "id": "9a8cfc29-859d-4400-8007-50eff0d731be",
            "name": "Lady Sarah Sandwich Cookies - Chocolate Cream Cookies Snacks",
            "description": "300G",
            "quantity": 0, "price": "2.19",
            "discount": 0,
            "rating": 4,
            "rating_count": 226,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "McrtOxsXhKBGq72xh0b9z4MERAjLDEEcQqS163VT.jpg",
            "category_id": 2,
            "created_at": "2023-11-06 20:39:26",
            "updated_at": "2023-11-06 20:39:26"
        },
        {
            "id": "9a8cfc72-05ea-4365-adad-37e5d0a5fcda",
            "name": "MARY MACLEOD'S SHORTBREAD 1 Quart Cookie Jar of Assorted Shortbread Cookies",
            "description": "320 Grams",
            "quantity": 0, "price": "50.0",
            "discount": 0,
            "rating": 5,
            "rating_count": 1,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "M3TQFPtf4MVUTrkgpQMmAojGBvtRNaHaEu7Id7o0.jpg",
            "category_id": 2,
            "created_at": "2023-11-06 20:40:14",
            "updated_at": "2023-11-06 20:40:14"
        },
        {
            "id": "9a8cfcaa-9f5a-41c1-8c0a-fc12fe3e6749",
            "name": "Chocolate and Vanilla Duplex Sandwich Cookies",
            "description": "Bulk Snacks 720g, Rich and Creamy Cream Biscuits | Premium Quality Grocery Food | Ideal School Snacks for Kids | Indulge in the Taste of Adoro Groceries",
            "quantity": 0, "price": "4.49",
            "discount": 0,
            "rating": 5,
            "rating_count": 4,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "1UEsuoEQsxGGvPxOjG9SOAVSv7k4kLKlkFRklxHD.jpg",
            "category_id": 2,
            "created_at": "2023-11-06 20:40:51",
            "updated_at": "2023-11-06 20:40:51"
        },
        {
            "id": "9a8cfd14-a11a-4f17-a54c-a8cbb54b819f",
            "name": "Vachon Ah Caramel! The Original Cakes with Caramel",
            "description": "Creamy Filling and Chocolatey Coating, Delicious Dessert and Snack, Contains 12 Twin-Wrapped Cakes, 336 Grams, Packaging may vary",
            "quantity": 0, "price": "3.97",
            "discount": 0,
            "rating": 5,
            "rating_count": 2177,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "63TLifsg5COxbpDlDp4xZeXTjdYiXV374Bl9uAFY.webp",
            "category_id": 2,
            "created_at": "2023-11-06 20:42:00",
            "updated_at": "2023-11-06 20:42:00"
        },
        {
            "id": "9a8cfd7c-5411-415a-bdb3-3e8bec16bd73",
            "name": "Hostess Chocolate Flavour Cupcakes Contains 6 Cupcakes",
            "description": "Hostess Chocolate Flavour Cupcakes Contains 6 Cupcakes",
            "quantity": 0, "price": "3.17",
            "discount": 0,
            "rating": 4,
            "rating_count": 2417,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "Ul830dKiXwVDllw8PLHm7mT3cOviX0piFT2C7jUi.webp",
            "category_id": 2,
            "created_at": "2023-11-06 20:43:08",
            "updated_at": "2023-11-06 20:43:08"
        },
        {
            "id": "9a8cfdf1-599e-4e50-8726-2abdfab58a39",
            "name": "Pillsbury Softbake S'Mores Flavour Bars",
            "description": "6 Bars",
            "quantity": 0, "price": "3.88",
            "discount": 0,
            "rating": 4,
            "rating_count": 1857,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "5UzEMZydqCNuifVkLevaYTr1mZg74Jz1YTeuXxXX.webp",
            "category_id": 2,
            "created_at": "2023-11-06 20:44:25",
            "updated_at": "2023-11-06 20:44:25"
        },
        {
            "id": "9a8cefe9-0e43-4db7-9391-61e32a6dc795",
            "name": "Misura Dolcesenza, Biscuits Made With Yogurt",
            "description": "No Sugar Added, Non GMO, 400g",
            "quantity": 0, "price": "5.49",
            "discount": 0,
            "rating": 4,
            "rating_count": 191,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "Lj0lkiJIjgKJIsNhSLvokgMT8Lkw9DAARv6CNcWb.jpg",
            "category_id": 2,
            "created_at": "2023-11-06 20:05:11",
            "updated_at": "2023-11-06 20:05:11"
        }
    ]
}

// End of Cookies

// Soups

const soups = {
    "name": "soups",
    "image-folder": "soup",
    "product": [
        {
            "id": "9a8cf0a3-11aa-473b-9f7a-7dccf8d3fdb8",
            "name": "Campbell's Condensed Tomato Soup",
            "description": "284 mL, 4 Count",
            "quantity": 0, "price": "14.23",
            "discount": 0.13,
            "rating": 5,
            "rating_count": 418,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "U0rV5XLS97YKmsBei57NO4yvXPHaJQLtBYB4aURv.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:07:13",
            "updated_at": "2023-11-06 20:07:13"
        },
        {
            "id": "9a8cf0fe-cc91-4697-a617-1edb5495c94e",
            "name": "Tim Hortons Chicken & Rice Soup",
            "description": "540mL Can",
            "quantity": 0, "price": "6.99",
            "discount": 0,
            "rating": 4,
            "rating_count": 2493,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "Te00jieLAFqtCLHRQ3k97NzAM7urrrHhqbKhAilf.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:08:13",
            "updated_at": "2023-11-06 20:08:13"
        },
        {
            "id": "9a8cf14c-249e-4a8b-8b95-ff8d3a971ad2",
            "name": "Campbell's Broccoli Cheese Soup",
            "description": "284 mL",
            "quantity": 0, "price": "1.99",
            "discount": 0,
            "rating": 4,
            "rating_count": 1119,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "Bcwl1Z2KIvXNFXtEksUDkos86hjsVBuKD8EEGELO.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:09:03",
            "updated_at": "2023-11-06 20:09:03"
        },
        {
            "id": "9a8cf19a-14c8-48e0-b759-78633719c600",
            "name": "Campbell's Low Fat Cream of Chicken Soup",
            "description": "284 mL",
            "quantity": 0, "price": "2.79",
            "discount": 0,
            "rating": 4,
            "rating_count": 390,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "zhSHGvtxjJl8XBN0BSB2wGzPsC5VExuQ4lblRlnZ.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:09:55",
            "updated_at": "2023-11-06 20:09:55"
        },
        {
            "id": "9a8cf1d9-7f04-4859-b02d-eb6dbba0432a",
            "name": "Amy'S Kitchen Organic Vegetable Barley Soup",
            "description": "398 ml",
            "quantity": 0, "price": "4.49",
            "discount": 0,
            "rating": 4,
            "rating_count": 622,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "DXZVRzTzb3m4fKaMvPLxldBpSH2cATN1hkyXFpII.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:10:36",
            "updated_at": "2023-11-06 20:10:36"
        },
        {
            "id": "9a8cf20b-6977-41c3-b3e7-7f005b96b942",
            "name": "Amy's Kitchen Soup-Hearty French, Country Vegetable",
            "description": "398 ml",
            "quantity": 0, "price": "4.19",
            "discount": 0.24,
            "rating": 4,
            "rating_count": 196,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "qk0exmp2EjKSUo9EvtC2enRqKk2DR6uBwHIz2PT6.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:11:09",
            "updated_at": "2023-11-06 20:11:09"
        },
        {
            "id": "9a8cf260-51b0-440f-bb70-e1853fa9daad",
            "name": "Lipton Soup Mix Noodle with Chicken Vegetable",
            "description": "117 GR 24 Count",
            "quantity": 0, "price": "54.96",
            "discount": 0,
            "rating": 4,
            "rating_count": 55,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "SOneWULybh1EUhdl7KpUCqpqtmZAWNLegfUkEnIk.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:12:04",
            "updated_at": "2023-11-06 20:12:04"
        },
        {
            "id": "9a8cf2a7-c148-4f46-939c-b8b6743ff125",
            "name": "Heinz Tomato Soup",
            "description": "Heinz Tomato Soup",
            "quantity": 0, "price": "39.75",
            "discount": 0,
            "rating": 5,
            "rating_count": 580,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "O7f6dU3IwKikxII1HBNYeXzeUEmP6z6Z0U4CRKb3.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:12:51",
            "updated_at": "2023-11-06 20:12:51"
        },
        {
            "id": "9a8cf2f1-95aa-4758-9ea8-f462e79b17a8",
            "name": "THAI KITCHEN Thai Bangkok Curry Instant Rice Noodle Soup",
            "description": "45 Gram",
            "quantity": 0, "price": "1.79",
            "discount": 0,
            "rating": 4,
            "rating_count": 473,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "7zYVFw62I5xnLJevlpr4o5WFMC40Ty7diQFvwKRC.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:13:40",
            "updated_at": "2023-11-06 20:13:40"
        },
        {
            "id": "9a8cf397-bb6b-4abf-a582-5bd8bd48b895",
            "name": "Amy's Organic Quinoa, Kale & Red Lentil soup (Vegan)",
            "description": "398ml 398 milliliter",
            "quantity": 0, "price": "5.49",
            "discount": 0,
            "rating": 4,
            "rating_count": 105,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "70VE6gSIiFmtcdpGGrcTG0qGzjlYYwDWaXynfJmi.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:15:29",
            "updated_at": "2023-11-06 20:15:29"
        },
        {
            "id": "9a8cf405-6608-4df0-badc-1dfdf3d87612",
            "name": "Lipton Soup Mix for an Easy Classic Soup Tomato Vegetable",
            "description": "No Artificial Flavours and Low Fat 145 g 24-Count",
            "quantity": 0, "price": "54.96",
            "discount": 0,
            "rating": 5,
            "rating_count": 100,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "pQyfS7f1gLGkX5hhiZEjFof9ddOv80DpcZsIYxOH.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:16:40",
            "updated_at": "2023-11-06 20:16:40"
        },
        {
            "id": "9a8cf44d-7cde-49ba-965f-39eb73ec6932",
            "name": "Knorr Cream of Mushroom Soup",
            "description": "71g (4 Serves)",
            "quantity": 0, "price": "2.49",
            "discount": 0,
            "rating": 4,
            "rating_count": 396,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "8XjlQBxBrdZKETZUkANo3cFaWtgoJUSStXTXXF2F.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:17:28",
            "updated_at": "2023-11-06 20:17:28"
        },
        {
            "id": "9a8cf498-e421-41ed-a892-acf0b08b5d32",
            "name": "Batchelors Cup a Soup with Croutons Tomato & Vegetable",
            "description": "(4 per Pack - 104g)",
            "quantity": 0, "price": "17.99",
            "discount": 0,
            "rating": 4,
            "rating_count": 143,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "OZSIvCKqUxwAJ9mGCdbi9iFeERoU7FyTW80XLtPN.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:18:17",
            "updated_at": "2023-11-06 20:18:17"
        },
        {
            "id": "9a8cf4e4-7702-4b0f-b4c1-610784488982",
            "name": "Tim Hortons Homestyle Beef Chili, Ready-to-Serve",
            "description": "Tim Hortons Homestyle Beef Chili, Ready-to-Serve",
            "quantity": 0, "price": "3.67",
            "discount": 0,
            "rating": 4,
            "rating_count": 2074,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "1PDNtc8jUNdbZxjOx3F0TKR2y797jFZbfPEGWfIQ.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:19:07",
            "updated_at": "2023-11-06 20:19:07"
        },
        {
            "id": "9a8cf51b-a9ec-4dd5-b063-472e6931714c",
            "name": "Pacific Foods Organic Condensed Cream of Mushroom Soup",
            "description": "284ml",
            "quantity": 0, "price": "3.99",
            "discount": 0,
            "rating": 4,
            "rating_count": 173,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "i1JibUTSL7YVaI8jFHVJmTFo7td5ruPEBD5v1e57.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:19:43",
            "updated_at": "2023-11-06 20:19:43"
        },
        {
            "id": "9a8cf55e-2576-4b3a-875b-a0be6b835186",
            "name": "Amy'S Kitchen Organic Cream Of Tomato Soup",
            "description": "398 ml",
            "quantity": 0, "price": "5.49",
            "discount": 0,
            "rating": 4,
            "rating_count": 43,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "2yxM7BHUazwBGJfjHIL2lfaJUGDMoWHSIergGYra.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:20:26",
            "updated_at": "2023-11-06 20:20:26"
        },
        {
            "id": "9a8cf5af-dfe4-4248-8737-d0932bda01df",
            "name": "Amy'S Kitchen Organic Light In Sodium Split Pea Soup",
            "description": "398 ml",
            "quantity": 0, "price": "5.49",
            "discount": 0,
            "rating": 4,
            "rating_count": 293,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "Hh5wjQtqgKo8YfCNkPNIlYQHNj4ha306LlJYgIso.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:21:20",
            "updated_at": "2023-11-06 20:21:20"
        },
        {
            "id": "9a8cf5de-301c-4654-832b-11f77f1bf55a",
            "name": "Campbell's Reduced Sodium Tomato Soup",
            "description": "284 mL",
            "quantity": 0, "price": "2.99",
            "discount": 0,
            "rating": 4,
            "rating_count": 176,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "DRAXIkNzq7uBXkYUddeT02AQJG2wRTLt5GUWy4LP.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:21:50",
            "updated_at": "2023-11-06 20:21:50"
        },
        {
            "id": "9a8cf634-1f98-4610-82dc-2aee1d673c6d",
            "name": "Edward & Sons Miso-Cup-Traditional with Tofu",
            "description": "36 g",
            "quantity": 0, "price": "7.79",
            "discount": 0,
            "rating": 4,
            "rating_count": 1830,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "F2rEKsCnyWOOnFRzz39XLcaBwdNaIY2kOF2mMaXX.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:22:47",
            "updated_at": "2023-11-06 20:22:47"
        },
        {
            "id": "9a8cf745-6b94-45c7-9651-42d084702aa8",
            "name": "Amy'S Kitchen Organic Alphabet Soup",
            "description": "398 ml",
            "quantity": 0, "price": "5.49",
            "discount": 0,
            "rating": 4,
            "rating_count": 81,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "5jPoSibYzUNdlGVZ4mUuxbA8pEWwXr7gLBLDc7Eh.jpg",
            "category_id": 3,
            "created_at": "2023-11-06 20:25:46",
            "updated_at": "2023-11-06 20:25:46"
        },
        {
            "id": "9a8cf7a2-17c9-4b8b-9a7e-ceaf03c1ea3b",
            "name": "Campbell's Cream of Mushroom Soup",
            "description": "284 ml (Pack of 12)",
            "quantity": 0, "price": "34.22",
            "discount": 0,
            "rating": 4,
            "rating_count": 81,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "HabXjLt0BFeZgMP3bn3T5w3jMmqatMM1zyWAgm5m.jpg",
            "category_id": 3,
            "created_at": "2023-11-06 20:26:46",
            "updated_at": "2023-11-06 20:26:46"
        },
        {
            "id": "9a8cf7f5-6f09-40c1-8ac4-a8db05f00899",
            "name": "San Remo Organic Vegetable Barley Soup",
            "description": "398ml",
            "quantity": 0, "price": "3.99",
            "discount": 0,
            "rating": 2,
            "rating_count": 2,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "E8pkKcTjOIcD3o3PoQ7uZgmSXTR9MRDrpxC5kpzb.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:27:41",
            "updated_at": "2023-11-06 20:27:41"
        },
        {
            "id": "9a8cf84b-bf02-4777-97c5-57264e1067e5",
            "name": "Hikari Awase Instant Miso Soup Variety Pack",
            "description": "20 Servings",
            "quantity": 0, "price": "23.32",
            "discount": 0,
            "rating": 5,
            "rating_count": 448,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "R6JtcvqVtl0lrnKYHEV8L3gDiFnx0L1fB4zxJK0Z.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:28:38",
            "updated_at": "2023-11-06 20:28:38"
        },
        {
            "id": "9a8cf8a4-d26e-48ba-8144-5b2de184ed8c",
            "name": "Eat Wholesome Organic Lentil & Zucchini Soup",
            "description": "398ml",
            "quantity": 0, "price": "4.19",
            "discount": 0,
            "rating": 4,
            "rating_count": 7,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "NQYnX1jWepdHNZh1GyD8PMOvMWIHlUP9FsLmgeeG.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:29:36",
            "updated_at": "2023-11-06 20:29:36"
        },
        {
            "id": "9a8cf8ef-9dab-4174-9026-0eec287e51cd",
            "name": "Amy's Organic Carrot Ginger (Non BPA Lining) soup",
            "description": "398ml 398 milliliter",
            "quantity": 0, "price": "5.49",
            "discount": 0,
            "rating": 4,
            "rating_count": 36,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "5SnQIizinQeWd4WZZlbtp0TdRDjeSmJUgupobDrc.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:30:25",
            "updated_at": "2023-11-06 20:30:25"
        },
        {
            "id": "9a8cf965-2f7a-4f11-94fa-b095a8910225",
            "name": "Miso Soup, with Vegetables, Haiku, Instant Soup Cup",
            "description": "Authentic Japanese Ingredients, 14g",
            "quantity": 0, "price": "4.49",
            "discount": 0,
            "rating": 4,
            "rating_count": 27,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "2lGRv6cdUJ3azKvCuB0C4etxusjlBipzvi2SMN4h.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:31:42",
            "updated_at": "2023-11-06 20:31:42"
        },
        {
            "id": "9a8cf9e7-53e6-4bc2-92fd-1685fb981581",
            "name": "Campbell's Chunky Creamy Chicken & Dumplings Soup",
            "description": "18.8 Ounce (Pack of 12)",
            "quantity": 0, "price": "94.01",
            "discount": 0,
            "rating": 5,
            "rating_count": 5806,
            "is_on_sale": 0,
            "is_best_seller": 0,
            "is_new_release": 0,
            "is_todays_deal": 0,
            "photo": "nrnPFKSgmdU4E7U7jaMIyBC8iGExlD3XYbsevXEq.webp",
            "category_id": 3,
            "created_at": "2023-11-06 20:33:07",
            "updated_at": "2023-11-06 20:33:07"
        }
    ]
}
// End of Soups
//#endregion