import  request  from "supertest"
import { DataSource } from "typeorm"
import app from "../../../app"
import { AppDataSource } from "../../../data-source"
import { mockedUser, mockedUserLogin, newClient, newClientInvalidUserId, newProduct, newProductInvalidUserId } from "../../mocks"



describe("/clients",() => {
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


    test("POST /clients -  Must be able to create a product",async () => {
        const responseLogin = await request(app).post('/login').send(mockedUserLogin)
        const token = `Bearer ${responseLogin.body.token}`

        const userTobeUpdateRequest = await request(app).get("/users").set("Authorization", token)
    
        newClient.user = userTobeUpdateRequest.body[0].id
        const response = await request(app).post("/clients").set("Authorization", token).send(newClient)

        expect(response.body).toHaveProperty("id")
        expect(response.body).toHaveProperty("name")
        expect(response.body).toHaveProperty("document")
        expect(response.body).toHaveProperty("email")
        expect(response.body).toHaveProperty("number")
        expect(response.status).toBe(201)
    
    })

    test("POST /clients - should not be able to create a product that already exists",async () => {
        const responseLogin = await request(app).post('/login').send(mockedUserLogin)
        const token = `Bearer ${responseLogin.body.token}`

        const userTobeUpdateRequest = await request(app).get("/users").set("Authorization", token)
    
        newClient.user = userTobeUpdateRequest.body[0].id
        const response = await request(app).post("/clients").set("Authorization", token).send(newClient)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(409)
    })

    test("POST /clients - should not be able to create product with invalid userId",async () => {
        const responseLogin = await request(app).post('/login').send(mockedUserLogin)
        const token = `Bearer ${responseLogin.body.token}`

        const response = await request(app).post("/clients").set("Authorization", token).send(newClientInvalidUserId)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(404)
    })

    test("POST /clients - should not be able to create another product without authorization",async () => {
        const response = await request(app).post("/clients").send(newClient)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(401)
    })

    test("GET /clients - Must be able to list all products",async () => {
        const getProducts = await request(app).get("/clients")

        expect(getProducts.body).toHaveProperty("id")
        expect(getProducts.body.clients).toHaveLength(1)
        expect(getProducts.status).toBe(200)
    }) 

    test("PACH /clients/:id - should not be able to update another product without authorization",async () => {
        const updateClient = {
            name: "cliente atualizado"
        }

        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin)
        const token = `Bearer ${userLoginResponse.body.token}`

        const clientTobeUpdateRequest = await request(app).get("/clients")
        const clientTobeUpdateId = clientTobeUpdateRequest.body.clients[0].id

        const response = await request(app).patch(`/clients/${clientTobeUpdateId}`).send(updateClient)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(401)

    }) 
    
    test("PACH /clients/:id - should not be able to update nother product without invalid productId",async () => {
        const updateClient = {
            name: "cliente atualizado"
        }

        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin)
        const token = `Bearer ${userLoginResponse.body.token}`

        const clientTobeUpdateRequest = await request(app).get("/clients")
        const clientTobeUpdateId = clientTobeUpdateRequest.body.clients[0].id

        const response = await request(app).patch(`/clients/123456`).set("Authorization", token).send(updateClient)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(404)
    })

    test("PACH /clients/:id - should not be able to update another client by changing the user",async () => {
        const updateClient = {
            user: "usuario atualizado"
        }

        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin)
        const token = `Bearer ${userLoginResponse.body.token}`

        const productTobeUpdateRequest = await request(app).get("/clients")
        const productTobeUpdateId = productTobeUpdateRequest.body.clients[0].id

        const response = await request(app).patch(`/clients/${productTobeUpdateId}`).set("Authorization", token).send(updateClient)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(400)

    })

    test("PACH /clients/:id - must be able update client",async () => {
        const updateClient = {
            name: "cliente atualizado"
        }

        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin)
        const token = `Bearer ${userLoginResponse.body.token}`

        const productTobeUpdateRequest = await request(app).get("/clients")
        const productTobeUpdateId = productTobeUpdateRequest.body.clients[0].id

        const response = await request(app).patch(`/clients/${productTobeUpdateId}`).set("Authorization", token).send(updateClient)

        const clientUpdated = await request(app).get(`/clients/${productTobeUpdateId}`).set("Authorization", token)

        expect(clientUpdated.body.name).toEqual("cliente atualizado")
        expect(response.status).toBe(200)
    })


    test("DELETE /clients/:id - should not be able to delete another client without authorization", async () => {
        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin)
        const token = `Bearer ${userLoginResponse.body.token}`

        const clientTobeUpdateRequest = await request(app).get("/clients")
        const clientTobeUpdateId = clientTobeUpdateRequest.body.clients[0].id

        const response = await request(app).delete(`/clients/${clientTobeUpdateId}`)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(401)
    })

    test("DELETE /clients/:id - should not be able to delete nother product without invalid productId",async () => {
        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin)
        const token = `Bearer ${userLoginResponse.body.token}`

        const clientTobeUpdateRequest = await request(app).get("/clients")
        const clientTobeUpdateId = clientTobeUpdateRequest.body.clients[0].id

        const response = await request(app).delete(`/clients/123456`).set("Authorization", token)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(404)
    })

    test("DELETE /clients/:id - must be able delete product",async () => {
        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin)
        const token = `Bearer ${userLoginResponse.body.token}`

        const clientTobeUpdateRequest = await request(app).get("/clients")
        const clientTobeUpdateId = clientTobeUpdateRequest.body.clients[0].id

        const response = await request(app).delete(`/clients/${clientTobeUpdateId}`).set("Authorization", token)

        const getProducts = await request(app).get("/clients")

        expect(getProducts.body.clients).toHaveLength(0)
        expect(response.status).toBe(204)
    })    


})