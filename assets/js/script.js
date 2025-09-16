"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // modal variables
  const modal = document.querySelector("[data-modal]");
  if (modal) {
    const modalCloseBtn = document.querySelector("[data-modal-close]");
    const modalCloseOverlay = document.querySelector("[data-modal-overlay]");

    // modal function
    const modalCloseFunc = function () {
      modal.classList.add("closed");
    };

    // modal eventListener
    if (modalCloseOverlay) {
      modalCloseOverlay.addEventListener("click", modalCloseFunc);
    }
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", modalCloseFunc);
    }
  }

  // notification toast variables
  const notificationToast = document.querySelector("[data-toast]");
  if (notificationToast) {
    const toastCloseBtn = document.querySelector("[data-toast-close]");

    // notification toast eventListener
    if (toastCloseBtn) {
      toastCloseBtn.addEventListener("click", function () {
        notificationToast.classList.add("closed");
      });
    }
  }

  // mobile menu variables
  const mobileMenuOpenBtn = document.querySelectorAll(
    "[data-mobile-menu-open-btn]"
  );
  const mobileMenu = document.querySelectorAll("[data-mobile-menu]");
  const mobileMenuCloseBtn = document.querySelectorAll(
    "[data-mobile-menu-close-btn]"
  );
  const overlay = document.querySelector("[data-overlay]");

  if (overlay) {
    for (let i = 0; i < mobileMenuOpenBtn.length; i++) {
      // mobile menu function
      const mobileMenuCloseFunc = function () {
        if (mobileMenu[i]) mobileMenu[i].classList.remove("active");
        overlay.classList.remove("active");
      };

      if (mobileMenuOpenBtn[i]) {
        mobileMenuOpenBtn[i].addEventListener("click", function () {
          if (mobileMenu[i]) mobileMenu[i].classList.add("active");
          overlay.classList.add("active");
        });
      }

      if (mobileMenuCloseBtn[i]) {
        mobileMenuCloseBtn[i].addEventListener("click", mobileMenuCloseFunc);
      }
      overlay.addEventListener("click", mobileMenuCloseFunc);
    }
  }

  // accordion variables
  const accordionBtn = document.querySelectorAll("[data-accordion-btn]");
  const accordion = document.querySelectorAll("[data-accordion]");

  for (let i = 0; i < accordionBtn.length; i++) {
    accordionBtn[i].addEventListener("click", function () {
      const nextEl = this.nextElementSibling;
      if (nextEl) {
        const clickedBtn = nextEl.classList.contains("active");

        for (let j = 0; j < accordion.length; j++) {
          if (clickedBtn) break;

          if (accordion[j] && accordion[j].classList.contains("active")) {
            accordion[j].classList.remove("active");
            if (accordionBtn[j]) accordionBtn[j].classList.remove("active");
          }
        }

        nextEl.classList.toggle("active");
        this.classList.toggle("active");
      }
    });
  }

  /* ========== E-COMMERCE LOGIC ========== */
  const getJSON = (key, defaultVal = []) =>
    JSON.parse(localStorage.getItem(key)) || defaultVal;
  const setJSON = (key, val) => localStorage.setItem(key, JSON.stringify(val));

  let cart = getJSON("cart");
  let wishlist = getJSON("wishlist");

  const cartCountElements = document.querySelectorAll(
    '.action-btn[aria-label="Shopping bag"] .count'
  );
  const wishlistCountElements = document.querySelectorAll(
    '.action-btn[aria-label="Wishlist"] .count'
  );
  const wishlistContainer = document.getElementById("wishlist-container");
  const cartContainer = document.getElementById("cart-container");
  const wishlistGrid = document.getElementById("wishlist-grid");
  const cartGrid = document.getElementById("cart-grid");

  const updateCounts = () => {
    cartCountElements.forEach((el) => (el.textContent = cart.length));
    wishlistCountElements.forEach((el) => (el.textContent = wishlist.length));
  };

  const createProductCard = (product, type) => {
    const card = document.createElement("div");
    card.className = "showcase";
    card.innerHTML = `
            <div class="showcase-banner">
                <img src="${product.img}" alt="${
      product.name
    }" width="300" class="product-img default">
                <img src="${product.imgHover || product.img}" alt="${
      product.name
    }" width="300" class="product-img hover">
            </div>
            <div class="showcase-content">
                <a href="#" class="showcase-category">${product.category}</a>
                <a href="#"><h3 class="showcase-title">${product.name}</h3></a>
                <div class="price-box">
                    <p class="price">${product.price}</p>
                    ${product.del ? `<del>${product.del}</del>` : ""}
                </div>
                <button class="remove-btn" data-name="${
                  product.name
                }" data-type="${type}">Remove</button>
            </div>
        `;
    return card;
  };

  const renderItems = (items, container, type) => {
    container.innerHTML = "";
    if (items.length === 0) {
      container.innerHTML = "<p>Your list is empty.</p>";
      return;
    }
    items.forEach((item) => {
      const card = createProductCard(item, type);
      container.appendChild(card);
      card.style.opacity = "0";
      setTimeout(() => (card.style.opacity = "1"), 100);
    });
  };

  const handleAction = (e, targetArray, storageKey, type) => {
    const showcase = e.target.closest(".showcase");
    if (!showcase) return;

    const product = {
      name: showcase.querySelector(".showcase-title").textContent.trim(),
      price: showcase.querySelector(".price").textContent.trim(),
      del: showcase.querySelector("del")
        ? showcase.querySelector("del").textContent.trim()
        : null,
      img: showcase.querySelector(".product-img.default").src,
      imgHover: showcase.querySelector(".product-img.hover")
        ? showcase.querySelector(".product-img.hover").src
        : null,
      category: showcase.querySelector(".showcase-category").textContent.trim(),
    };

    if (!targetArray.some((p) => p.name === product.name)) {
      targetArray.push(product);
      setJSON(storageKey, targetArray);
      updateCounts();
      showSuccessMessage(`✓ Item added to ${type} successfully`);
      // Always render the cart and wishlist, regardless of whether they are currently displayed
      if (type === "cart" && cartGrid) {
        renderItems(cart, cartGrid, "cart");
      } else if (type === "wishlist" && wishlistGrid) {
        renderItems(wishlist, wishlistGrid, "wishlist");
      }
    } else {
      showSuccessMessage(`${product.name} is already in your ${type}`);
    }
  };

  const showSuccessMessage = (message) => {
    const successMessageDiv = document.getElementById("success-message");
    if (successMessageDiv) {
      successMessageDiv.textContent = message;
      successMessageDiv.classList.add("show");
      setTimeout(() => {
        successMessageDiv.classList.remove("show");
      }, 2000);
    }
  };

  document
    .querySelectorAll(
      '.product-grid .btn-action ion-icon[name="bag-add-outline"]'
    )
    .forEach((icon) => {
      icon.parentElement.addEventListener("click", (e) =>
        handleAction(e, cart, "cart", "cart")
      );
    });

  document
    .querySelectorAll(
      '.product-grid .btn-action ion-icon[name="heart-outline"]'
    )
    .forEach((icon) => {
      icon.parentElement.addEventListener("click", (e) =>
        handleAction(e, wishlist, "wishlist", "wishlist")
      );
    });

  document.querySelectorAll(".add-cart-btn").forEach((button) => {
    button.addEventListener("click", (e) =>
      handleAction(e, cart, "cart", "cart")
    );
  });

  const handleRemove = (e) => {
    if (!e.target.classList.contains("remove-btn")) return;
    const { name, type } = e.target.dataset;
    let targetArray, storageKey, container;

    if (type === "wishlist") {
      targetArray = wishlist;
      storageKey = "wishlist";
      container = wishlistGrid;
    } else {
      targetArray = cart;
      storageKey = "cart";
      container = cartGrid;
    }

    const itemIndex = targetArray.findIndex((p) => p.name === name);
    if (itemIndex > -1) {
      const card = e.target.closest(".showcase");
      card.style.opacity = "0";
      setTimeout(() => {
        targetArray.splice(itemIndex, 1);
        setJSON(storageKey, targetArray);
        renderItems(targetArray, container, type);
        updateCounts();
      }, 300);
    }
  };

  if (wishlistGrid) {
    wishlistGrid.addEventListener("click", handleRemove);
  }
  if (cartGrid) {
    cartGrid.addEventListener("click", handleRemove);
  }

  const toggleView = (view) => {
    const isWishlistVisible = wishlistContainer.style.display === "block";
    const isCartVisible = cartContainer.style.display === "block";

    wishlistContainer.style.display = "none";
    cartContainer.style.display = "none";

    if (view === "wishlist" && !isWishlistVisible) {
      wishlistContainer.style.display = "block";
      renderItems(wishlist, wishlistGrid, "wishlist");
    } else if (view === "cart" && !isCartVisible) {
      cartContainer.style.display = "block";
      renderItems(cart, cartGrid, "cart");
    }
  };

  const wishlistBtn = document.querySelector(
    '.action-btn[aria-label="Wishlist"]'
  );
  if (wishlistBtn) {
    wishlistBtn.addEventListener("click", () => toggleView("wishlist"));
  }
  const cartBtn = document.querySelector(
    '.action-btn[aria-label="Shopping bag"]'
  );
  if (cartBtn) {
    cartBtn.addEventListener("click", () => toggleView("cart"));
  }
  const mobileWishlistBtn = document.querySelector(
    '.mobile-bottom-navigation .action-btn[aria-label="Wishlist"]'
  );
  if (mobileWishlistBtn) {
    mobileWishlistBtn.addEventListener("click", () => toggleView("wishlist"));
  }
  const mobileCartBtn = document.querySelector(
    '.mobile-bottom-navigation .action-btn[aria-label="Shopping bag"]'
  );
  if (mobileCartBtn) {
    mobileCartBtn.addEventListener("click", () => toggleView("cart"));
  }

  // Render cart and wishlist items on page load
  if (cartGrid) {
    renderItems(cart, cartGrid, "cart");
  }
  if (wishlistGrid) {
    renderItems(wishlist, wishlistGrid, "wishlist");
  }

  updateCounts();
});
