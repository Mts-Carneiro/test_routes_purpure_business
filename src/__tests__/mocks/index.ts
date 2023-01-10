export const mockedUser = {
    fantasy_name: "Joana",
    password: "123456",
    email: "joana@mail.com",
    cnpj: "13043000000100"

}

export const mockedUser_2 = {
    fantasy_name: "Mario",
    email: "mario@mail.com",
    password: "123456",
    cnpj: "14043000000100"

}

export const mockedUserLogin = {
    email: "joana@mail.com",
    password: "123456"
}

export const mockedUserLogin_2 = {
    email: "mario@mail.com",
    password: "123456"
}

export const newClient = {
    name: "Jonas",
    document: "11122233345",
    email: "jonas@mail.com",
    number: "00912345678"
}

export const newProduct = {
    name: "produto_1",
    value: "10",
    stock: "5"
}

export const newSale = {
    client: "Jonas",
    product: "produto_1",
    amout: 5
}

/* 
    Users:
        CNPJ
        Password
        Email
        CommercialName

    Clients:
        Name
        Document
        Email
        Number

    Products:
        Name
        Value
        Stock

    Sales:
        client_id
        product_id
        amout
*/