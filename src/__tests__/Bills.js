/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page and I click on bill eye icon", () => {
    test("Then, bill proof image appear", () => {
      // localStorage should be populated with  data
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      // Set up the document body of BillsUi
      document.body.innerHTML = BillsUI({ data: bills });
      // mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      //creating new Bill
      const billsBoard = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: localStorageMock,
      });
      //mock function handleClickIconEye from Bill.js
      $.fn.modal = jest.fn();
      const handleClickIconEye = jest.fn(() => {
        billsBoard.handleClickIconEye;
      });
      const eye = screen.getAllByTestId("icon-eye")[0];
      eye.addEventListener("click", handleClickIconEye);
      userEvent.click(eye);

      expect(handleClickIconEye).toHaveBeenCalled();

      const img = document.querySelector(".bill-proof-container img");
      expect(eye.getAttribute("data-bill-url")).toEqual(img.getAttribute("src"));
    });
  });
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      // localStorage should be populated with employee credentials
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.body.innerHTML = '<div id="root"></div>';
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      //get the icon from VerticalLayout.js
      const windowIcon = screen.getByTestId("icon-window");
      //expect having the class active-icon
      //correction here
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
    test("Then bills should be ordered from earliest to latest", () => {
      // Simule la fonction getBills avant d'injecter les notes de frai dans BillUi
      const getBills = bills.sort((a, b) => (a.date < b.date ? 1 : -1));
      document.body.innerHTML = BillsUI({ data: getBills });
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  // test d'intégration GET
  describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
      test("Then, bills should be showed", async () => {
        Object.defineProperty(window, "localStorage", { value: localStorageMock });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        document.body.innerHTML = '<div id="root"></div>';
        router();
        window.onNavigate(ROUTES_PATH.Bills);

        const tableBills = await waitFor(() => screen.getByTestId("tbody"));
        expect(tableBills).toBeTruthy();
        expect(tableBills.querySelectorAll("tr")).toHaveLength(4);
        expect(screen.getAllByText("encore"));
      });
    });
    describe("When an error occurs on API", () => {
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
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });

});
