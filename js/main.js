//enable popover
const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));


//gender custom
if(window.location.pathname === '/'){ //only on index page
    const femaleBtn = document.querySelector('#female');
    const maleBtn = document.querySelector('#male');
    const customBtn = document.querySelector('#custom');
    const genderCustom = document.querySelector('#gender-custom');

    femaleBtn.addEventListener('change', function() {
        genderCustom.classList.add('d-none');
    });
    maleBtn.addEventListener('change', function() {
        genderCustom.classList.add('d-none');
    });
    customBtn.addEventListener('change', function() {
        genderCustom.classList.remove('d-none');
    });
}
