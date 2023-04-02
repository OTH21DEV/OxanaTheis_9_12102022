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

  /**
   * test
   */
  // describe("When I am on NewBill Page and I upload file with good extension (jpg|jpeg|png)", () => {
  //   test("Then my input file should be added", async () => {
  //     document.body.innerHTML = NewBillUI()
  //   // mock navigation to test it
  //   const onNavigate = (pathname) => {
  //     document.body.innerHTML = ROUTES({ pathname });
  //   };
  //     const newBill = new NewBill({
  //       document, onNavigate, store: mockStore, localStorage: window.localStorage
  //     })

  //     // Edit Input File
  //     const input = screen.getByTestId('file')
  //     const file = new File(['img'], 'image.png', {type:'image/png'})
  //     const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
  //     input.addEventListener('change', handleChangeFile)
  //     userEvent.upload(input, file)

  //     expect(handleChangeFile).toHaveBeenCalled()
  //     expect(input.files[0]).toStrictEqual(file)
  //     expect(input.files[0].name).toMatch(/(\.jpg|\.jpeg|\.png)$/i)
  //     await waitFor(() => expect(newBill.validFile).toBe(true))
  //   })
  // })
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
     
      // expect(file.files[0].value).toMatch(/(\.jpg|\.jpeg|\.png)$/i)
      expect(file.files[0].name).toBe("myProof.png");
    });
  });


//test

// describe("When i select a file which not allow ", async () => {
//   test("It should show an error ", async () => {
//     // const handleChangeFile = jest.fn(NewBill.handleChangeFile);
//     // const file = screen.getByTestId("file");

//     // file.addEventListener("change", handleChangeFile);
//     // // simulate ulpoad event

//     // fireEvent.change(file, { target: { files: [new File(["myProof.pdf"], "myProof.pdf", { type: "image/pdf" })] } });
//     // expect(handleChangeFile).toHaveBeenCalled();
   
//     // expect(file.files[0].name).toBe("myProof.pdf");

//     //   expect(file.files[0].name).not.toMatch(/(\.jpg|\.jpeg|\.png)$/i)
//     document.body.innerHTML = NewBillUI()
//    // mock navigation to test it
//    const onNavigate = (pathname) => {
//     document.body.innerHTML = ROUTES({ pathname });
//   };
//       const newBill = new NewBill({
//         document, onNavigate, store: mockStore, localStorage: window.localStorage
//       })

//       // Edit Input File
//       const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
//       const input = screen.getByTestId('file')
//       const file = new File(['video'], 'bill.mp4', {type:'video/mp4'})
//       input.addEventListener('change', handleChangeFile)
//       fireEvent.change(input, { target: { files: [new File(["myProof.pdf"], "myProof.pdf", { type: "image/pdf" })] } });
//       // userEvent.upload(input, file)

//       expect(handleChangeFile).toHaveBeenCalled()
//       expect(input.files[0]).toStrictEqual(file)
//       expect(input.files[0].name).not.toMatch(/(\.jpg|\.jpeg|\.png)$/i)
//       await waitFor(() => expect(newBill.validFile).toBe(false))
//     })

//   });
});



/////



/**
 * POST integration test
 */
// describe("Given I am connected as an employee", () => {
//   describe("When I create a new bill", () => {
//     /**
//      * 200
//      */
//     test("post bill from mock API POST", async () => {
//       const updateBill = mockStore.bills().update();
//       const addedBill = await updateBill.then((value) => {
//         return value;
//       });

//       expect(addedBill.id).toEqual("47qAXb6fIm2zOKkLzMro");
//       expect(addedBill.amount).toEqual(400);
//       expect(addedBill.fileUrl).toEqual("https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a");
//     });

//     /**
//      * 404
//      */
//     //     test("post bill from mock API POST and fails with 404 message error", async () => {
//     //     mockStore.create.mockImplementationOnce(() =>
//     //         Promise.reject(new Error("Erreur 404"))
//     //       )
//     //       const html = BillsUI({ error: "Erreur 404" })
//     //       document.body.innerHTML = html
//     //       const message = await screen.getByText(/Erreur 404/)
//     //       expect(message).toBeTruthy()
//     //     })

//     //     /**
//     //      * 500
//     //      */
//     //     test("post bill from mock API POST and fails with 500 message error", async () => {
//     //     mockStore.create.mockImplementationOnce(() =>
//     //         Promise.reject(new Error("Erreur 500"))
//     //       )
//     //       const html = BillsUI({ error: "Erreur 500" })
//     //       document.body.innerHTML = html
//     //       const message = await screen.getByText(/Erreur 500/)
//     //       expect(message).toBeTruthy()
//     //     })
//   });
// });
// describe("When an error occurs on API", () => {
//   test("Then fetch error 500 from API", async () => {
//     jest.spyOn(mockStore, "bills");
//     console.error = jest.fn();

//     Object.defineProperty(window, "localStorage", { value: localStorageMock });
//     window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
//     document.body.innerHTML = `<div id="root"></div>`;
//     router();
//     window.onNavigate(ROUTES_PATH.NewBill);

//     mockStore.bills.mockImplementationOnce(() => {
//       return {
//         update: () => {
//           return Promise.reject(new Error("Erreur 500"));
//         },
//       };
//     });
//   });
// });
