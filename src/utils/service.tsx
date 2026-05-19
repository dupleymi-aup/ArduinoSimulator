import settings from "./service.json"

const getFallbackLanguage: () => string = () => {
  return settings.LANGUAGE_FALLBACK
}

const getBoards: () => string[] = () => {
  return settings.BOARDS
}

const isMega: (boardType: string) => boolean = (boardType: string) => {
  if (!boardType) {
    return false
  } else if (boardType.toLocaleLowerCase().indexOf("mega") > -1) {
    return true
  }
  return false
}

const isNano: (boardType: string) => boolean = (boardType: string) => {
  if (!boardType) {
    return false
  } else if (boardType.toLocaleLowerCase().indexOf("nano") > -1) {
    return true
  }
  return false
}

export { getFallbackLanguage, getBoards, isMega, isNano }
