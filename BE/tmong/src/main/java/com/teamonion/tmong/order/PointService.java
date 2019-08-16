package com.teamonion.tmong.order;

import com.teamonion.tmong.exception.GlobalException;
import com.teamonion.tmong.exception.OrdersExceptionType;
import com.teamonion.tmong.member.Member;
import com.teamonion.tmong.member.MemberService;
import com.teamonion.tmong.websocket.OrdersUpdateRequest;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PointService {

    @NonNull
    private final MemberService memberService;

    private static final double BONUS_RATE = 0.1;

    void pointProcess(Orders orders) {
        long buyerOwnPoint = memberService.getPoint(orders.getBuyer().getId());

        long point = buyerOwnPoint - orders.getAmount();

        if (point < 0) {
            throw new GlobalException(OrdersExceptionType.ORDER_POINT_LACK);
        }

        memberService.pointUpdate(orders.getBuyer().getId(), point);
    }

    public void addBonusPoint(Orders orders) {
        long point = (long) (orders.getAmount() * BONUS_RATE)
                + memberService.getPoint(orders.getBuyer().getId());

        memberService.pointUpdate(orders.getBuyer().getId(), point);
    }

}
