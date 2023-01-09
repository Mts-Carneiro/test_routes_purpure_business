import  request  from "supertest"
import { DataSource } from "typeorm"
import app from "../../../app"
import { AppDataSource } from "../../../data-source"
import { mockedUser } from "../../mocks"





describe("/users", () => {

    let connection: DataSource

    beforeAll(async () => {
        await AppDataSource.initialize().then((res) => {
            connection = res
        }).catch((err) => {
            console.error("Error during Data Source initialization", err)
        })
    })

    afterAll(async () => {
        await connection.destroy()
    })

    test("POST /users -  Must be able to create a user",async () => {
        const response = await request(app).post("/user").send(mockedUser)

        expect(response.body).toHaveProperty("id")
        expect(response.body).toHaveProperty("email")
        expect(response.body).toHaveProperty("createdAt")
        expect(response.body).toHaveProperty("updatedAt")
        expect(response.body).toHaveProperty("password")
        expect(response.body).toHaveProperty("cnpj")
        expect(response.body.email).toEqual("joana@mail.com")
        expect(response.body.fantasy_name).toEqual("Joana")
        expect(response.body.cnpj).toEqual("13043000000100")
        expect(response.status).toBe(201)

    })

    test("POST /users -  should not be able to create a user that already exists",async () => {
        const response = await request(app).post("/user").send(mockedUser)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(401)
    })

})