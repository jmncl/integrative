import Swal from 'sweetalert2'

export const askConfirm = (title, text) => Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
    confirmButtonColor: '#c8102e',
    cancelButtonColor: '#111111'
}).then(result => result.isConfirmed)
