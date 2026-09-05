document.addEventListener('DOMContentLoaded', function () {

  /* --------------------------------------------------------------------
     Mobile navigation toggle
     -------------------------------------------------------------------- */
  var navToggle = document.getElementById('navToggle');
  var primaryNav = document.getElementById('primaryNav');

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = primaryNav.classList.toggle('is-open');
      navToggle.classList.toggle('is-active', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close the menu after tapping a link (mobile)
    primaryNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        primaryNav.classList.remove('is-open');
        navToggle.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* --------------------------------------------------------------------
     Scroll-to-top button
     -------------------------------------------------------------------- */
  var scrollTopBtn = document.getElementById('scrollTop');

  if (scrollTopBtn) {
    var toggleScrollButton = function () {
      if (window.scrollY > 420) {
        scrollTopBtn.classList.add('is-visible');
      } else {
        scrollTopBtn.classList.remove('is-visible');
      }
    };

    window.addEventListener('scroll', toggleScrollButton, { passive: true });
    toggleScrollButton();

    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --------------------------------------------------------------------
     Contact form validation
     -------------------------------------------------------------------- */
  var form = document.getElementById('contactForm');

  if (form) {
    var nameInput = document.getElementById('name');
    var emailInput = document.getElementById('email');
    var messageInput = document.getElementById('message');
    var status = document.getElementById('formStatus');

    var errors = {
      name: document.getElementById('nameError'),
      email: document.getElementById('emailError'),
      message: document.getElementById('messageError')
    };

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setError(input, errorEl, message) {
      input.closest('.form-field').classList.add('has-error');
      errorEl.textContent = message;
    }

    function clearError(input, errorEl) {
      input.closest('.form-field').classList.remove('has-error');
      errorEl.textContent = '';
    }

    function validateName() {
      var value = nameInput.value.trim();
      if (value.length < 2) {
        setError(nameInput, errors.name, 'الرجاء إدخال اسم لا يقل عن حرفين.');
        return false;
      }
      clearError(nameInput, errors.name);
      return true;
    }

    function validateEmail() {
      var value = emailInput.value.trim();
      if (!emailPattern.test(value)) {
        setError(emailInput, errors.email, 'الرجاء إدخال بريد إلكتروني صحيح.');
        return false;
      }
      clearError(emailInput, errors.email);
      return true;
    }

    function validateMessage() {
      var value = messageInput.value.trim();
      if (value.length < 10) {
        setError(messageInput, errors.message, 'الرجاء كتابة رسالة لا تقل عن 10 أحرف.');
        return false;
      }
      clearError(messageInput, errors.message);
      return true;
    }

    // Validate as the user types/leaves a field, so errors clear as soon as fixed
    nameInput.addEventListener('blur', validateName);
    emailInput.addEventListener('blur', validateEmail);
    messageInput.addEventListener('blur', validateMessage);
    nameInput.addEventListener('input', function () {
      if (nameInput.closest('.form-field').classList.contains('has-error')) validateName();
    });
    emailInput.addEventListener('input', function () {
      if (emailInput.closest('.form-field').classList.contains('has-error')) validateEmail();
    });
    messageInput.addEventListener('input', function () {
      if (messageInput.closest('.form-field').classList.contains('has-error')) validateMessage();
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var isNameValid = validateName();
      var isEmailValid = validateEmail();
      var isMessageValid = validateMessage();

      if (!isNameValid) {
        nameInput.focus();
      } else if (!isEmailValid) {
        emailInput.focus();
      } else if (!isMessageValid) {
        messageInput.focus();
      }

      if (isNameValid && isEmailValid && isMessageValid) {
        status.textContent = 'تم إرسال رسالتك بنجاح، سنعاود التواصل معك قريبًا.';
        status.classList.add('success');
        form.reset();

        // Clear the success message after a while
        setTimeout(function () {
          status.textContent = '';
          status.classList.remove('success');
        }, 6000);
      } else {
        status.textContent = 'الرجاء تصحيح الحقول المُشار إليها قبل الإرسال.';
        status.classList.remove('success');
      }
    });
  }

});
