/**
 * @jest-environment jsdom
 */
import { localStorageMock } from "../__mocks__/localStorage.js";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

import BillsUI from "../views/BillsUI.js";
jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee on NewBill Page", () => {
  let billForm;
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );
    // Set up the document body of new Bill
    document.body.innerHTML = NewBillUI();
    // mock navigation to test it
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    billForm = new NewBill({
      document,
      onNavigate,
      store: null,
      localStorage: localStorageMock,
    });
  });
  /**Submit */
  describe("When i submit the form ", () => {
    test("It chould create a new bill", () => {
      const handleSubmit = jest.fn(NewBill.handleSubmit);
      const newBillForm = screen.getByTestId("form-new-bill");
      newBillForm.addEventListener("submit", handleSubmit);
      fireEvent.submit(newBillForm);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  /**On change */

  describe("When i select a file ", async () => {
    test("It should changed the file name in the input", () => {
      const handleChangeFile = jest.fn(NewBill.handleChangeFile);
      const file = screen.getByTestId("file");

      file.addEventListener("change", handleChangeFile);
      // simulate ulpoad event

      fireEvent.change(file, { target: { files: [new File(["myProof.png"], "myProof.png", { type: "image/png" })] } });
      expect(handleChangeFile).toHaveBeenCalled();
      expect(file.files.length).toBe(1);

      //  expect(file.files[0].value).toMatch(/(\.jpg|\.jpeg|\.png)$/i)
      expect(file.files[0].name).toBe("myProof.png");
    });
  });



  describe("When I am on NewBill Page and I upload file with good extension (jpg|jpeg|png)", () => {
    test("Then my input file should be added", async () => {
      document.body.innerHTML = NewBillUI()
         const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
         }
      const newBill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })

      // Edit Input File
      const input = screen.getByTestId('file')
      const file = new File(['img'], 'image.png', {type:'image/png'})
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      input.addEventListener('change', handleChangeFile)
      userEvent.upload(input, file)

      expect(handleChangeFile).toHaveBeenCalled()
      //toStrictEqual - test that objects have the same structure and type
      expect(input.files[0]).toStrictEqual(file)
      expect(input.files[0].name).toBe('image.png')
      expect(input.files[0].name).toMatch(/(\.jpg|\.jpeg|\.png)$/i)

    })
    test('Then bill file should be created', async () => {
      // we have to use mockStore to simulate add of bill image
      const addedBill = mockStore.bills().create()
      const newImg = await addedBill.then((value) => {
        return value
      })

      expect(newImg.fileUrl).toEqual('https://localhost:3456/images/test.jpg')
      expect(newImg.key).toEqual('1234')
    })
  })
  describe("When I am on NewBill Page and I upload file with incorect format", () => {
    test("Then my input file should be invalid", async () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
     }
      const newBill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })

      // Edit Input File
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      const input = screen.getByTestId('file')
      const file = new File(['video'], 'bill.mp4', {type:'video/mp4'})
      input.addEventListener('change', handleChangeFile)
      userEvent.upload(input, file)

      expect(handleChangeFile).toHaveBeenCalled()
      expect(input.files[0]).toStrictEqual(file)
       expect(input.files[0].name).not.toMatch(/(\.jpg|\.jpeg|\.png)$/i)
    //  expect(input.files[0].name).not.toBe("bill.jpeg")
    //  expect(input.files[0].name).not.toBe("bill.jpg")
    //  expect(input.files[0].name).not.toBe("bill.png")
     expect(input.value).toBe("")
     })
  })

  //test
});

/**
 * POST integration test
 */
describe("Given I am connected as an employee", () => {
  describe("When I create a new bill", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.body.innerHTML = '<div id="root"></div>';
      router();
    });

    test("Then newBill should be created", async () => {
      // we have to use mockStore to simulate bill creation
      const updateBill = mockStore.bills().update();
      const addedBill = await updateBill.then((value) => {
        return value;
      });

      expect(addedBill.id).toEqual("47qAXb6fIm2zOKkLzMro");
      expect(addedBill.amount).toEqual(400);
      expect(addedBill.fileUrl).toEqual("https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a");
    });

    /**
     * 500
     */
    test("Then fetch error 500 from API", async () => {
      jest.spyOn(mockStore, "bills");
      console.error = jest.fn();

      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      document.body.innerHTML = `<div id="root"></div>`;
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
//overide Promise resolve
      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

      // Submit form
      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener("submit", handleSubmit);

      fireEvent.submit(form);
      await new Promise(process.nextTick);
      expect(console.error).toBeCalled();
    });
  });
});
