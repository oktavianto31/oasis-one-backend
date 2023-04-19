const STORAGEPATH = './storage'

const config = {
    ROOT_ADDRESS : process.env.ADDRESS,
    ROOT_STORAGE : './storage',
    AVATAR      : STORAGEPATH + '/avatars/',
    MENU        : STORAGEPATH + '/menus/',
    PROMO       : STORAGEPATH + '/promos/',
    CONTRACT    : STORAGEPATH + '/contract/',
    FOODCOURT   : STORAGEPATH + '/foodcourts/',
    ALLOWED_FILETYPES   : [
        "jpg", "jpeg", "png", "pdf",
    ] 
}

export default config;