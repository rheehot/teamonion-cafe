package com.teamonion.tmong.menu;

import com.teamonion.tmong.exception.CustomException;
import com.teamonion.tmong.exception.CustomExceptionType;
import com.teamonion.tmong.exception.ValidCustomException;
import com.teamonion.tmong.exception.ValidExceptionType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class MenuService {
    private static Logger log = LoggerFactory.getLogger(MenuController.class);

    private final MenuRepository menuRepository;

    public MenuService(MenuRepository menuRepository) {
        this.menuRepository = menuRepository;
    }

    Long add(MenuSaveDto menuSaveDto) {
        MultipartFile imageFile = menuSaveDto.getImageFile();

        if (imageFile.getOriginalFilename().isEmpty()) {
            throw new CustomException(CustomExceptionType.MENUIMAGE_NOT_FOUND);

        }
        menuSaveDto.setImagePath(saveMenuImage(imageFile));

        Menu menu = menuSaveDto.toEntity();
        return menuRepository.save(menu).getId();
    }

    List<Menu> selectAll() {
        return menuRepository.findAll();
    }

    public void updateMenu(Long id, MenuSaveDto menuSaveDto) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new ValidCustomException(ValidExceptionType.MENU_NOT_FOUND));

        String path = menu.getImagePath();
        MultipartFile imageFile = menuSaveDto.getImageFile();

        if(imageFile.getOriginalFilename().isEmpty()) {
            throw new CustomException(CustomExceptionType.MENUIMAGE_NOT_FOUND);
        }
        menuSaveDto.setImagePath(saveMenuImage(menuSaveDto.getImageFile()));
        menu.update(menuSaveDto);
        menuRepository.save(menu);

        deleteMenuImage(path);
    }

    public String saveMenuImage(MultipartFile imageFile) {
        try {
            String DOWNLOAD_PATH = "src/main/resources/menuUpload";
            // TODO : 난수 생성 후 fileName 설정
            int randomString = (int)(Math.random() * 10000) + 1;
            String fileName = randomString + System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
            Path path = Paths.get(DOWNLOAD_PATH + "/" + fileName);

            imageFile.transferTo(path);

            return DOWNLOAD_PATH + "/" + fileName;
        } catch (IOException e) {
            throw new CustomException(CustomExceptionType.MENUIMAGE_RENDER_ERROR);
        }
    }

    void deleteByMenuId(Long id) {
        Menu menu = menuRepository.findById(id).orElseThrow(() -> new ValidCustomException(ValidExceptionType.MENU_NOT_FOUND));
        String path = menu.getImagePath();

        menuRepository.deleteById(id);
        deleteMenuImage(path);
    }

    private void deleteMenuImage(String path) {
        File file = new File(path);

        if (file.exists()) {
            file.delete();
        }
    }

    List<Menu> selectByName(String name) {
        return menuRepository.findByName(name);
    }
}
