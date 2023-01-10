import  request  from "supertest"
import { DataSource } from "typeorm"
import app from "../../../app"
import { AppDataSource } from "../../../data-source"
import { mockedUser, newProduct, newProductInvalidUserId } from "../../mocks"



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
        const responseLogin = await request(app).post('/login').send(mockedUser)
        const token = `Bearer ${responseLogin.body.token}`

        const userTobeUpdateRequest = await request(app).get("/users").set("Authorization", token)
    
        newProduct.user = userTobeUpdateRequest.body[0].id
        const response = await request(app).post("/post").set("Authorization", token).send(newProduct)

        expect(response.body).toHaveProperty("id")
        expect(response.body).toHaveProperty("name")
        expect(response.body).toHaveProperty("value")
        expect(response.body).toHaveProperty("stock")
        expect(response.status).toBe(201)
    
    })

    test("POST /products - should not be able to create a product that already exists",async () => {
        const responseLogin = await request(app).post('/login').send(mockedUser)
        const token = `Bearer ${responseLogin.body.token}`

        const userTobeUpdateRequest = await request(app).get("/users").set("Authorization", token)
    
        newProduct.user = userTobeUpdateRequest.body[0].id
        const response = await request(app).post("/post").set("Authorization", token).send(newProduct)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(409)
    })

    test("POST /products - should not be able to create product with invalid userId",async () => {
        const responseLogin = await request(app).post('/login').send(mockedUser)
        const token = `Bearer ${responseLogin.body.token}`

        const response = await request(app).post("/post").set("Authorization", token).send(newProductInvalidUserId)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(404)
    })
})