export const removePunc = (para) => {
    let updatedPara = {
        ...para,
        paragraph:  para.paragraph.replace(/[^\p{L}\p{N}\p{Z}]/gu, '').replace(/\s+/g, " ").toLowerCase()
    }
    return updatedPara;
}