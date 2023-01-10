import  request  from "supertest"
import { DataSource } from "typeorm"
import app from "../../../app"
import { AppDataSource } from "../../../data-source"
import { mockedUser, mockedUserLogin, mockedUserLogin_2 } from "../../mocks"





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

    test("DELETE /users/:id -  should not be able to delete another user without authorization",async () => {
        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin);
        const secondLoginResponse = await request(app).post("/login").send(mockedUserLogin_2);
        const UserTobeDeleted = await request(app).get('/users').set("Authorization", `Bearer ${secondLoginResponse.body.token}`)

        const response = await request(app).delete(`/users/${UserTobeDeleted.body[0].id}`).set("Authorization", `Bearer ${userLoginResponse.body.token}`)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(403)
    })

    test("DELETE /users/:id -  Must be able to soft delete user",async () => {
        await request(app).post("/user").send(mockedUser)

        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin)
        const userTobeDeleted = await request(app).get("/users").set("Authorization", `Bearer ${userLoginResponse.body.token}`)

        const response = await request(app).delete(`/users/${userTobeDeleted.body[0].id}`).set("Authorization", `Bearer ${userLoginResponse.body.token}`)
        const findUser = await request(app).get("/users").set("Authorization", `Bearer ${userLoginResponse.body.token}`)

        expect(response.status).toBe(204)
        expect(findUser.body[0].isActive).toBe(false)

    })

    test("DELETE /users/:id -  shouldn't be able to delete user with isActive = false",async () => {
        await request(app).post("/user").send(mockedUser)

        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin)
        const userTobeDeleted = await request(app).get("/users").set("Authorization", `Bearer ${userLoginResponse.body.token}`)

        const response = await request(app).delete(`/users/${userTobeDeleted.body[0].id}`).set("Authorization", `Bearer ${userLoginResponse.body.token}`)
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty("message")
    })

    test("DELETE /users/:id -  should not be able to delete user with invalid id",async () => {
        await request(app).post("/user").send(mockedUser)

        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin)

        const response = await request(app).delete(`/users/13970660-5dbe-423a-9a9d-5c23b8882dsa`).set("Authorization", `Bearer ${userLoginResponse.body.token}`)
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty("message")
    })

    test("PATCH /users/:id -  should not be able to update another user without authorization",async () => {
        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin);
        const UserToBePach = await request(app).get('/users').set("Authorization", `Bearer ${userLoginResponse.body.token}`)

        const response = await request(app).patch(`/users/${UserToBePach.body[0].id}`)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(401)
    } )

    test("PATCH /users/:id - should not be able to update user with invalid id",async () => {
        const newValues = {
            fantasy_name: "Joana Bezerra",
            password: "1234567"
        }

        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin)
        const token = `Bearer ${userLoginResponse.body.token}`

        const response = await request(app).patch("/users/13970660-5dbe-423a-9a9d-5c23b8882dsa").set("Authorization",token).send(newValues)
        
        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(404)
    })

    test("PATCH /users/:id - should not be able to update isActive field value",async () => {
        const newValues = {
            isActive: false
        }

        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin)
        const token = `Bearer ${userLoginResponse.body.token}`

        const userTobeUpdateRequest = await request(app).get("/users").set("Authorization", token)
        const userTobeUpdateId = userTobeUpdateRequest.body[0].id

        const response = await request(app).patch(`/users/${userTobeUpdateId}`).set("Authorization",token).send(newValues)
        
        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(401)

    })

    test("PATCH /users/:id - should not be able to update id field value",async () => {
        const newValues = {
            id: false
        }

        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin)
        const token = `Bearer ${userLoginResponse.body.token}`

        const userTobeUpdateRequest = await request(app).get("/users").set("Authorization", token)
        const userTobeUpdateId = userTobeUpdateRequest.body[0].id

        const response = await request(app).patch(`/users/${userTobeUpdateId}`).set("Authorization",token).send(newValues)
        
        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(401)
    })

    test("PATCH /users/:id -  should be able to update user",async () => {
        const newValues = {
            fantasy_name: "Joana LTDA",
            password: "1234567"
        }

        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin)
        const token = `Bearer ${userLoginResponse.body.token}`

        const userTobeUpdateRequest = await request(app).get("/users").set("Authorization", token)
        const userTobeUpdateId = userTobeUpdateRequest.body[0].id

        const response = await request(app).patch(`/users/${userTobeUpdateId}`).set("Authorization",token).send(newValues)

        const userUpdated = await request(app).get("/users").set("Authorization", token)
        
        expect(userUpdated.body[0].fantasy_name).toEqual("Joana LTDA")
        expect(userUpdated.body[0]).not.toHaveProperty("password")
        expect(response.status).toBe(200)
    })


})