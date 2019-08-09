package com.teamonion.tmong.menu;

import com.teamonion.tmong.exception.GlobalExceptionType;
import com.teamonion.tmong.exception.GlobalException;
import com.teamonion.tmong.authorization.JwtComponent;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class MenuService {
    private static final Logger log = LoggerFactory.getLogger(MenuService.class);

    @NonNull
    private final MenuRepository menuRepository;

    @NonNull
    private final ImageFileService imageFileService;

    @NonNull
    private final JwtComponent jwtComponent;

    Long add(MenuAddRequest menuAddRequest) {
        String path = imageFileService.imageSaveProcess(menuAddRequest.getImageFile());

        return menuRepository.save(menuAddRequest.toEntity(path)).getId();
    }

    @Transactional
    public void updateMenu(Long id, MenuUpdateRequest menuUpdateRequest) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new GlobalException(GlobalExceptionType.MENU_NOT_FOUND));

        String imagePath = menu.getImagePath();
        MultipartFile imageFile = menuUpdateRequest.getImageFile();

        if (imageFile != null) {
            imageFileService.deleteImageFile(imagePath);
            imagePath = imageFileService.imageSaveProcess(imageFile);
        }

        menu = menuUpdateRequest.toEntity(imagePath);
        menu.update(id);
        menuRepository.save(menu);
    }

    Page<Menu> selectAll(Pageable pageable) {
        return menuRepository.findAllByDeletedFalse(pageable);
    }

    Page<Menu> selectByName(Pageable pageable, String name) {
        return menuRepository.findByNameContainingAndDeletedFalse(pageable, name);
    }

    @Transactional
    void deleteByMenuId(Long id) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new GlobalException(GlobalExceptionType.MENU_NOT_FOUND));
        String imagePath = menu.getImagePath();

        menu.delete();
        menuRepository.save(menu);

        imageFileService.deleteImageFile(imagePath);
    }

    public List<Menu> getOrderMenus(List<Long> menuIdList) {
        return menuIdList.stream()
                .map(e -> menuRepository.findByIdAndDeletedFalse(e)
                        .orElseThrow(() -> new GlobalException(GlobalExceptionType.ORDER_MENU_NOT_FOUND)))
                .collect(Collectors.toList());
    }
}
