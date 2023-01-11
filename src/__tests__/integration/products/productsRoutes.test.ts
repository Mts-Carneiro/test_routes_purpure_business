import  request  from "supertest"
import { DataSource } from "typeorm"
import app from "../../../app"
import { AppDataSource } from "../../../data-source"
import { mockedUser, mockedUserLogin, newProduct, newProductInvalidUserId } from "../../mocks"



describe("/products",() => {
    let connection: DataSource

    beforeAll(async () => {
        await AppDataSource.initialize().then((res) => {
            connection = res
        }).catch((err) => {
            console.error("Error during Data Source initialization", err)
        })

        await request(app).post('/users').send(mockedUser)
        
    })

    afterAll(async () => {
        await connection.destroy()
    })


    test("POST /products -  Must be able to create a product",async () => {
        const responseLogin = await request(app).post('/login').send(mockedUserLogin)
        const token = `Bearer ${responseLogin.body.token}`

        const userTobeUpdateRequest = await request(app).get("/users").set("Authorization", token)
    
        newProduct.user = userTobeUpdateRequest.body[0].id
        const response = await request(app).post("/products").set("Authorization", token).send(newProduct)

        expect(response.body).toHaveProperty("id")
        expect(response.body).toHaveProperty("name")
        expect(response.body).toHaveProperty("value")
        expect(response.body).toHaveProperty("stock")
        expect(response.status).toBe(201)
    
    })

    test("POST /products - should not be able to create a product that already exists",async () => {
        const responseLogin = await request(app).post('/login').send(mockedUserLogin)
        const token = `Bearer ${responseLogin.body.token}`

        const userTobeUpdateRequest = await request(app).get("/users").set("Authorization", token)
    
        newProduct.user = userTobeUpdateRequest.body[0].id
        const response = await request(app).post("/products").set("Authorization", token).send(newProduct)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(409)
    })

    test("POST /products - should not be able to create product with invalid userId",async () => {
        const responseLogin = await request(app).post('/login').send(mockedUserLogin)
        const token = `Bearer ${responseLogin.body.token}`

        const response = await request(app).post("/products").set("Authorization", token).send(newProductInvalidUserId)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(404)
    })

    test("POST /products - should not be able to create another product without authorization",async () => {
        const response = await request(app).post("/products").send(newProduct)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(401)
    })

    test("GET /products - Must be able to list all products",async () => {
        const getProducts = await request(app).get("/products")

        expect(getProducts.body).toHaveProperty("id")
        expect(getProducts.body).toHaveLength(1)
        expect(getProducts.status).toBe(200)
    }) 

    test("PACH /products/:id - should not be able to update another product without authorization",async () => {
        const updateProduct = {
            name: "produto atualizado"
        }

        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin)
        const token = `Bearer ${userLoginResponse.body.token}`

        const productTobeUpdateRequest = await request(app).get("/products")
        const productTobeUpdateId = productTobeUpdateRequest.body.products[0].id

        const response = await request(app).patch(`/products/${productTobeUpdateId}`).send(updateProduct)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(401)

    }) 
    
    test("PACH /products/:id - should not be able to update nother product without invalid productId",async () => {
        const updateProduct = {
            name: "produto atualizado"
        }

        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin)
        const token = `Bearer ${userLoginResponse.body.token}`

        const productTobeUpdateRequest = await request(app).get("/products")
        const productTobeUpdateId = productTobeUpdateRequest.body.products[0].id

        const response = await request(app).patch(`/products/123456`).set("Authorization", token).send(updateProduct)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(404)
    })

    test("PACH /products/:id - should not be able to update another product by changing the user",async () => {
        const updateProduct = {
            user: "usuario atualizado"
        }

        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin)
        const token = `Bearer ${userLoginResponse.body.token}`

        const productTobeUpdateRequest = await request(app).get("/products")
        const productTobeUpdateId = productTobeUpdateRequest.body.products[0].id

        const response = await request(app).patch(`/products/${productTobeUpdateId}`).set("Authorization", token).send(updateProduct)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(400)

    })

    test("PACH /products/:id - must be able update product",async () => {
        const updateProduct = {
            name: "produto atualizado"
        }

        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin)
        const token = `Bearer ${userLoginResponse.body.token}`

        const productTobeUpdateRequest = await request(app).get("/products")
        const productTobeUpdateId = productTobeUpdateRequest.body.products[0].id

        const response = await request(app).patch(`/products/${productTobeUpdateId}`).set("Authorization", token).send(updateProduct)

        const productUpdated = await request(app).get(`/products/${productTobeUpdateId}`).set("Authorization", token)

        expect(productUpdated.body.name).toEqual("produto atualizado")
        expect(response.status).toBe(200)
    })


    test("DELETE /products/:id - should not be able to delete another product without authorization", async () => {
        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin)
        const token = `Bearer ${userLoginResponse.body.token}`

        const productTobeUpdateRequest = await request(app).get("/products")
        const productTobeUpdateId = productTobeUpdateRequest.body.products[0].id

        const response = await request(app).delete(`/products/${productTobeUpdateId}`)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(401)
    })

    test("DELETE /products/:id - should not be able to delete nother product without invalid productId",async () => {
        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin)
        const token = `Bearer ${userLoginResponse.body.token}`

        const productTobeUpdateRequest = await request(app).get("/products")
        const productTobeUpdateId = productTobeUpdateRequest.body.products[0].id

        const response = await request(app).delete(`/products/123456`).set("Authorization", token)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(404)
    })

    test("DELETE /products/:id - must be able delete product",async () => {
        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin)
        const token = `Bearer ${userLoginResponse.body.token}`

        const productTobeDeletedRequest = await request(app).get("/products")
        const productTobeDeletedId = productTobeDeletedRequest.body.products[0].id

        const response = await request(app).delete(`/products/${productTobeDeletedId}`).set("Authorization", token)

        const getProducts = await request(app).get("/products")

        expect(getProducts.body.products).toHaveLength(0)
        expect(response.status).toBe(204)
    })    


})