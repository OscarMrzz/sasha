import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('login');
});

test.describe("Login",()=>{
    test("Verificar que no se puede dejar en blanco el campo de correo electrónico", async ({ page }) => {
       await page.getByLabel("Correo electrónico",{exact:true}).fill("");
       await page.getByLabel("Contraseña",{exact:true}).fill("1234567");
       await page.getByRole("button",{name:"Iniciar Sesión"}).click();

       const emailInput = page.locator("input[type='email']");
  
      await expect(emailInput).not.toHaveJSProperty('validationMessage', '');
      await expect(emailInput).toHaveJSProperty('validationMessage', '¡El correo es obligatorio!');
 
        

    })
    test("Verificar que no se puede dejar en blanco el campo de contraseña", async ({ page }) => {
       await page.getByLabel("Correo electrónico",{exact:true}).fill("osscarodriguez@gmail.com");
       await page.getByLabel("Contraseña",{exact:true}).fill("");
       await page.getByRole("button",{name:"Iniciar Sesión"}).click();

       const passwordInput = page.locator("input[type='password']");
       await expect(passwordInput).not.toHaveJSProperty('validationMessage', '');
       await expect(passwordInput).toHaveJSProperty('validationMessage', '¡La contraseña es obligatoria!');
        

    })

    test("Verificar que se muestra el mensaje de error al intentar iniciar sesión con una contraseña incorrecta", async ({ page }) => {
       await page.getByLabel("Correo electrónico",{exact:true}).fill("osscarodriguez@gmail.com");
       await page.getByLabel("Contraseña",{exact:true}).fill("AAAAA");
       await page.getByRole("button",{name:"Iniciar Sesión"}).click();
       await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    })
    test("Verificar que se muestra el mensaje de error al intentar iniciar sesión con un correo inválido", async ({ page }) => {
       await page.getByLabel("Correo electrónico",{exact:true}).fill("Aosscarodriguez@gmail.com");
       await page.getByLabel("Contraseña",{exact:true}).fill("12345678");
       await page.getByRole("button",{name:"Iniciar Sesión"}).click();
       await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    })

    test("verifica que si pueda entrar con credenciales correctas", async ({ page }) => {
       await page.getByLabel("Correo electrónico",{exact:true}).fill("osscarodriguez@gmail.com");
       await page.getByLabel("Contraseña",{exact:true}).fill("12345678");
       await page.getByRole("button",{name:"Iniciar Sesión"}).click();
       await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
       await expect(page).toHaveURL(/.*PanelControlPage/);

    })
})