const profileIcon = document.getElementById("profileIcon");
const dropdown = document.getElementById("dropdownMenu");
const usericon = document.querySelector(".profile-container");
const authlink = document.querySelector(".auth");
const dashboardbthn = document.querySelector("a");
const link = document.querySelector(".btn-primary");
const loginFooterLink = document.querySelector('.footer-box a[href="/login"]');
const getstartedlink = document.querySelector(".cta a");
const hamburger = document.getElementById("hamburger");
const navLinks = document.querySelector(".nav-links");
const authlinkmobile = document.querySelector(".auth-link");
const logoutmobile = document.querySelector("#logoutmobile");

// Toggle profile dropdown
profileIcon?.addEventListener("click", () => {
  dropdown.classList.toggle("show");
});

// Click outside to close dropdown & nav menu
window.addEventListener("click", function (e) {
  if (!profileIcon.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.remove("show");
  }
  if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
    navLinks.classList.remove("show");
  }
});

// Hamburger toggle
hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});

// On page load
window.addEventListener("DOMContentLoaded", async () => {
  let res = await fetch("/checklogin", { method: "GET" ,credentials : "include"});
  const text = await res.text();

  const isMobile = window.innerWidth <= 768;

  if (text === "not loggedin") {
    // Not logged in
    usericon.style.display = "none";
    authlink.style.visibility = "visible";
    dashboardbthn.style.display = "none";
    loginFooterLink.style.display = "inline-block";
    logoutmobile.style.display = "none";

    if (link !== null) {
      link.href = "login";
      getstartedlink.style.display = "inline-block";
    }

    if (isMobile) {
      authlinkmobile.style.display = "block";
    }

  } else {
    // Logged in
    usericon.style.display = isMobile ? "none" : "inline-block";
    logoutmobile.style.display = isMobile ? "inline-block" : "none";

    authlink.style.display = "none";
    dashboardbthn.style.display = "inline-block";
    loginFooterLink.style.display = "none";
    authlinkmobile.style.display = "none";

    if (link !== null) {
      getstartedlink.style.display = "none";
    }
  }

  // Home redirection
  if (window.location.pathname === "/" && text !== "not loggedin") {
    link.href = "/dashboard";
  }
});
